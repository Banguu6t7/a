import { Finding, ReviewResult, ReviewFile } from "./engine";
import { calculateScores, generateSummary, detectLanguage } from "./engine";
import { generateId } from "../utils";

export const DEMO_CODE = `import { db } from "./db";
import { hashPassword } from "./auth";

export async function createUser(req: Request) {
  const { username, password, email, role } = await req.json();

  // TODO: Add input validation

  const hashedPassword = await hashPassword(password);

  var query = "INSERT INTO users (username, password, email, role) VALUES ('" + 
    username + "', '" + hashedPassword + "', '" + email + "', '" + role + "')";

  const result = await db.query(query);

  console.log("User created:", result);

  return new Response(JSON.stringify({ success: true, userId: result.id }), {
    status: 201,
  });
}

export async function getUser(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  const query = "SELECT * FROM users WHERE id = " + id;
  const user = await db.query(query);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}`;

export function generateDemoReview(files?: ReviewFile[]): ReviewResult {
  const demoFiles: ReviewFile[] = files || [{
    name: "auth.ts", path: "auth.ts", language: "typescript",
    content: DEMO_CODE, lines: DEMO_CODE.split("\n").length,
  }];

  const findings: Finding[] = [
    { id: generateId(), severity: "critical", category: "security", title: "SQL Injection",
      description: "User input is directly concatenated into SQL queries without parameterization. An attacker could inject malicious SQL to read, modify, or delete database data.",
      file: "auth.ts", lineStart: 10, lineEnd: 12,
      recommendation: "Use parameterized queries or a query builder like Prisma/Knex.",
      suggestedFix: `const query = "INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4)";
const result = await db.query(query, [username, hashedPassword, email, role]);`, confidence: 0.98 },
    { id: generateId(), severity: "critical", category: "security", title: "SQL Injection in GET endpoint",
      description: "The 'id' parameter from URL query is directly concatenated into a SQL query, allowing injection attacks.",
      file: "auth.ts", lineStart: 22, lineEnd: 23,
      recommendation: "Use parameterized queries for all database operations.",
      suggestedFix: `const query = "SELECT * FROM users WHERE id = $1";
const user = await db.query(query, [id]);`, confidence: 0.97 },
    { id: generateId(), severity: "high", category: "security", title: "Missing Authorization Check",
      description: "The createUser endpoint does not verify if the requester has permission to create users with arbitrary roles. Any user could create an admin account.",
      file: "auth.ts", lineStart: 4, lineEnd: 6,
      recommendation: "Add role-based access control before processing the request.",
      suggestedFix: `const session = await getSession(req);
if (!session || session.role !== "admin") {
  return new Response("Forbidden", { status: 403 });
}`, confidence: 0.92 },
    { id: generateId(), severity: "high", category: "bug", title: "Missing Input Validation",
      description: "No validation is performed on user inputs (username, password, email, role). This can lead to invalid data, security issues, and application crashes.",
      file: "auth.ts", lineStart: 4, lineEnd: 6,
      recommendation: "Validate all inputs using a schema validator like Zod or Joi.",
      suggestedFix: `import { z } from "zod";

const schema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});

const body = schema.parse(await req.json());`, confidence: 0.95 },
    { id: generateId(), severity: "medium", category: "performance", title: "Unnecessary console.log in Production",
      description: "console.log statements should not be present in production code as they impact performance and may leak sensitive information.",
      file: "auth.ts", lineStart: 14, lineEnd: 14,
      recommendation: "Remove debug logging or use a structured logging library.",
      suggestedFix: `// Remove or replace with proper logger
// logger.info("User created", { userId: result.id });`, confidence: 0.88 },
    { id: generateId(), severity: "medium", category: "bug", title: "No Error Handling",
      description: "Database operations are not wrapped in try-catch blocks. Database failures will cause unhandled exceptions.",
      file: "auth.ts", lineStart: 4, lineEnd: 16,
      recommendation: "Wrap database operations in try-catch and return appropriate error responses.",
      suggestedFix: `try {
  const result = await db.query(query);
  return new Response(JSON.stringify({ success: true }), { status: 201 });
} catch (error) {
  return new Response("Internal server error", { status: 500 });
}`, confidence: 0.9 },
    { id: generateId(), severity: "low", category: "maintainability", title: "Use of var keyword",
      description: "The 'var' keyword has function scope and hoisting issues. Modern JavaScript/TypeScript should use 'const' or 'let'.",
      file: "auth.ts", lineStart: 9, lineEnd: 9,
      recommendation: "Replace var with const or let.",
      suggestedFix: `const query = "INSERT INTO users ...";`, confidence: 0.95 },
    { id: generateId(), severity: "low", category: "maintainability", title: "TODO Marker Present",
      description: "A TODO comment indicates incomplete work that should be addressed.",
      file: "auth.ts", lineStart: 6, lineEnd: 6,
      recommendation: "Implement input validation or remove the TODO marker.",
      suggestedFix: `// Implement Zod schema validation here`, confidence: 0.99 },
    { id: generateId(), severity: "info", category: "quality", title: "Missing Return Type Annotation",
      description: "Function lacks explicit return type annotation, reducing type safety.",
      file: "auth.ts", lineStart: 4, lineEnd: 4,
      recommendation: "Add explicit return types to functions.",
      suggestedFix: `export async function createUser(req: Request): Promise<Response> {`, confidence: 0.8 },
  ];

  const scores = calculateScores(findings);
  const summary = generateSummary(findings);

  return {
    id: generateId(), title: demoFiles[0]?.name || "Demo Review",
    files: demoFiles, findings, scores, summary,
    status: "complete", createdAt: new Date().toISOString(), language: "typescript",
  };
}

export function generateDemoReviews(): ReviewResult[] {
  return [
    generateDemoReview(),
    { ...generateDemoReview(), id: generateId(), title: "api/routes.py", language: "python", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { ...generateDemoReview(), id: generateId(), title: "src/components/AuthForm.tsx", language: "typescript", createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];
}
