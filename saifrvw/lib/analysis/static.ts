import { Finding, ReviewFile } from "./engine";
import { generateId } from "../utils";

export function runStaticAnalysis(files: ReviewFile[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const lang = file.language;
    const lines = file.content.split("\n");
    if (["javascript", "typescript", "jsx", "tsx"].includes(lang)) {
      findings.push(...analyzeJavaScript(file, lines));
    } else if (lang === "python") {
      findings.push(...analyzePython(file, lines));
    }
  }
  return findings;
}

function analyzeJavaScript(file: ReviewFile, lines: string[]): Finding[] {
  const findings: Finding[] = [];
  const patterns = [
    { regex: /eval\s*\(/, severity: "critical" as const, category: "security" as const, title: "Dangerous eval() usage", description: "Using eval() can lead to arbitrary code execution vulnerabilities.", recommendation: "Avoid eval(). Use JSON.parse for JSON, or safer alternatives." },
    { regex: /document\.write\s*\(/, severity: "high" as const, category: "security" as const, title: "Unsafe document.write()", description: "document.write() can introduce XSS vulnerabilities and block rendering.", recommendation: "Use DOM manipulation methods instead of document.write()." },
    { regex: /innerHTML\s*=/, severity: "high" as const, category: "security" as const, title: "Potential XSS via innerHTML", description: "Setting innerHTML with untrusted data can lead to XSS attacks.", recommendation: "Use textContent or sanitize input with a library like DOMPurify." },
    { regex: /password|secret|api_key|apikey|token/i, severity: "critical" as const, category: "security" as const, title: "Potential hardcoded secret", description: "Hardcoded credentials or secrets detected in source code.", recommendation: "Use environment variables or a secure secret management system." },
    { regex: /SELECT\s+.*\s+FROM/i, severity: "critical" as const, category: "security" as const, title: "Potential SQL Injection", description: "String concatenation in SQL queries can lead to SQL injection.", recommendation: "Use parameterized queries or an ORM." },
    { regex: /new\s+Function\s*\(/, severity: "high" as const, category: "security" as const, title: "Dynamic code execution", description: "new Function() is similar to eval() and executes arbitrary code.", recommendation: "Avoid dynamic code generation. Use safer alternatives." },
    { regex: /setTimeout\s*\(\s*["']/, severity: "medium" as const, category: "bug" as const, title: "setTimeout with string argument", description: "Passing a string to setTimeout causes implicit eval().", recommendation: "Pass a function reference instead of a string." },
    { regex: /console\.log\s*\(/, severity: "low" as const, category: "quality" as const, title: "Console log statement", description: "console.log() should not be present in production code.", recommendation: "Remove debug logging or use a proper logging library." },
    { regex: /TODO|FIXME|HACK|XXX/, severity: "info" as const, category: "maintainability" as const, title: "Code marker found", description: "TODO/FIXME markers indicate incomplete work.", recommendation: "Address or remove markers before production." },
    { regex: /var\s+/, severity: "low" as const, category: "maintainability" as const, title: "Use of var keyword", description: "var has function scope and hoisting issues. Prefer let or const.", recommendation: "Replace var with const or let." },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        if (pattern.title.includes("secret") && line.trim().startsWith("//")) continue;
        findings.push({
          id: generateId(), severity: pattern.severity, category: pattern.category,
          title: pattern.title, description: pattern.description, file: file.path,
          lineStart: i + 1, lineEnd: i + 1, recommendation: pattern.recommendation,
          suggestedFix: `// Fix: ${pattern.recommendation}`, confidence: 0.85,
        });
      }
    }
  }
  return findings;
}

function analyzePython(file: ReviewFile, lines: string[]): Finding[] {
  const findings: Finding[] = [];
  const patterns = [
    { regex: /eval\s*\(/, severity: "critical" as const, category: "security" as const, title: "Dangerous eval() usage", description: "eval() executes arbitrary Python code and is a security risk.", recommendation: "Use ast.literal_eval for safe evaluation of literals." },
    { regex: /exec\s*\(/, severity: "critical" as const, category: "security" as const, title: "Dangerous exec() usage", description: "exec() executes arbitrary Python code.", recommendation: "Avoid exec(). Refactor to use safer code patterns." },
    { regex: /subprocess\.call\s*\(.*shell\s*=\s*True/, severity: "critical" as const, category: "security" as const, title: "Shell injection risk", description: "subprocess with shell=True is vulnerable to shell injection.", recommendation: "Use shell=False and pass arguments as a list." },
    { regex: /pickle\.loads?\s*\(/, severity: "high" as const, category: "security" as const, title: "Unsafe deserialization", description: "pickle can execute arbitrary code during deserialization.", recommendation: "Use json or a safe serialization format." },
    { regex: /password|secret|api_key|apikey|token/i, severity: "critical" as const, category: "security" as const, title: "Potential hardcoded secret", description: "Hardcoded credentials detected.", recommendation: "Use environment variables or a secret manager." },
    { regex: /SELECT\s+.*\s+FROM/i, severity: "critical" as const, category: "security" as const, title: "Potential SQL Injection", description: "String formatting in SQL queries is dangerous.", recommendation: "Use parameterized queries with placeholders." },
    { regex: /TODO|FIXME|HACK|XXX/, severity: "info" as const, category: "maintainability" as const, title: "Code marker found", description: "TODO/FIXME markers indicate incomplete work.", recommendation: "Address markers before production deployment." },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        if (pattern.title.includes("secret") && line.trim().startsWith("#")) continue;
        findings.push({
          id: generateId(), severity: pattern.severity, category: pattern.category,
          title: pattern.title, description: pattern.description, file: file.path,
          lineStart: i + 1, lineEnd: i + 1, recommendation: pattern.recommendation,
          suggestedFix: `# Fix: ${pattern.recommendation}`, confidence: 0.85,
        });
      }
    }
  }
  return findings;
}
