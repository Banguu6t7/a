export interface Finding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: "security" | "bug" | "performance" | "quality" | "maintainability";
  title: string;
  description: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  recommendation: string;
  suggestedFix: string;
  confidence: number;
}

export interface ReviewResult {
  id: string;
  title: string;
  files: ReviewFile[];
  findings: Finding[];
  scores: { overall: number; security: number; reliability: number; performance: number; maintainability: number };
  summary: { critical: number; high: number; medium: number; low: number; info: number; total: number };
  status: "pending" | "analyzing" | "complete" | "error";
  createdAt: string;
  language: string;
}

export interface ReviewFile {
  name: string;
  path: string;
  language: string;
  content: string;
  lines: number;
}

export interface AnalysisInput {
  files: ReviewFile[];
  title?: string;
}

export function calculateScores(findings: Finding[]): ReviewResult["scores"] {
  const weights = { critical: 25, high: 15, medium: 8, low: 3, info: 0 };
  const severityCounts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
  };
  const totalPenalty = Object.entries(severityCounts).reduce(
    (sum, [sev, count]) => sum + weights[sev as keyof typeof weights] * count, 0
  );
  const baseScore = Math.max(0, 100 - totalPenalty);
  const catScore = (cat: string) => {
    const cf = findings.filter((f) => f.category === cat);
    if (cf.length === 0) return baseScore;
    const p = cf.reduce((s, f) => s + ({ critical: 20, high: 12, medium: 6, low: 2, info: 0 }[f.severity] || 0), 0);
    return Math.max(0, 100 - p);
  };
  const overall = Math.round(baseScore * 0.4 + catScore("security") * 0.25 + catScore("bug") * 0.15 + catScore("performance") * 0.1 + catScore("maintainability") * 0.1);
  return {
    overall: Math.min(100, Math.max(0, overall)),
    security: Math.min(100, Math.max(0, Math.round(catScore("security")))),
    reliability: Math.min(100, Math.max(0, Math.round(catScore("bug")))),
    performance: Math.min(100, Math.max(0, Math.round(catScore("performance")))),
    maintainability: Math.min(100, Math.max(0, Math.round(catScore("maintainability")))),
  };
}

export function generateSummary(findings: Finding[]): ReviewResult["summary"] {
  return {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
    total: findings.length,
  };
}

export function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    js: "javascript", ts: "typescript", jsx: "jsx", tsx: "tsx", py: "python", go: "go",
    rs: "rust", java: "java", rb: "ruby", php: "php", cs: "csharp", cpp: "cpp",
    c: "c", swift: "swift", kt: "kotlin", scala: "scala", sql: "sql",
    html: "html", css: "css", json: "json", yaml: "yaml", yml: "yaml",
    md: "markdown", sh: "bash", dockerfile: "dockerfile",
  };
  return map[ext] || "text";
}
