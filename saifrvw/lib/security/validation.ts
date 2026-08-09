export const ALLOWED_EXTENSIONS = [
  ".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".rs", ".java",
  ".rb", ".php", ".cs", ".cpp", ".c", ".swift", ".kt", ".scala",
  ".sql", ".html", ".css", ".json", ".yaml", ".yml", ".md",
  ".sh", ".dockerfile",
];

export const MAX_FILE_SIZE = 1024 * 1024;
export const MAX_TOTAL_SIZE = 10 * 1024 * 1024;
export const MAX_FILES = 50;

export function isAllowedFile(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

export function validateRepositoryUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTP/HTTPS URLs are supported" };
    }
    if (!parsed.hostname.endsWith("github.com")) {
      return { valid: false, error: "Only public GitHub repositories are supported in this version" };
    }
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) {
      return { valid: false, error: "Invalid repository URL format. Expected: github.com/owner/repo" };
    }
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.")) {
      return { valid: false, error: "Private/internal URLs are not allowed" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/\.\./g, "").replace(/[<>:"|?*]/g, "").replace(/^\//, "").replace(/\//g, "_");
}

export function validateCodeInput(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Code cannot be empty" };
  }
  if (code.length > MAX_TOTAL_SIZE) {
    return { valid: false, error: `Code exceeds maximum size of ${MAX_TOTAL_SIZE / 1024 / 1024}MB` };
  }
  const dangerousPatterns = [
    /rm\s+-rf\s+\//, /:\(\){ :|:& };:/, /powershell\s+-enc/, /cmd\.exe/,
    /<script\b[^>]*>[^<]*eval\s*\(/i,
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return { valid: false, error: "Potentially dangerous code patterns detected" };
    }
  }
  return { valid: true };
}
