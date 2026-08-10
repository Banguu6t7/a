#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/workspaces/a/saifrvw"
EXPECTED_NAME="saifrvw"
EXPECTED_ORG="duckx"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.sentinel-v5.1-backup-$STAMP"

log() {
  printf '\n[SENTINEL] %s\n' "$1"
}

die() {
  printf '\n[SENTINEL] ERROR: %s\n' "$1" >&2
  exit 1
}

rollback() {
  printf '\n============================================================\n'
  printf ' VALIDATION FAILED — ROLLING BACK\n'
  printf '============================================================\n'

  if [ -d "$BACKUP/src" ]; then
    rm -rf "$ROOT/src"
    cp -a "$BACKUP/src" "$ROOT/src"
  fi

  for f in package.json package-lock.json tsconfig.json next.config.mjs; do
    if [ -f "$BACKUP/$f" ]; then
      cp "$BACKUP/$f" "$ROOT/$f"
    fi
  done

  rm -rf "$ROOT/.next"

  printf 'Rollback completed.\n'
}

trap 'rollback' ERR

printf '\n============================================================\n'
printf ' SAIFRVW — SENTINEL ENGINE v5.1\n'
printf ' SAFE ANALYZER + REMEDIATION + AI + REPORTS + PRICING\n'
printf '============================================================\n'

# ------------------------------------------------------------
# PROJECT SAFETY
# ------------------------------------------------------------

log "Checking project location..."

[ -d "$ROOT" ] || die "Project directory does not exist: $ROOT"
cd "$ROOT"

[ -f package.json ] || die "package.json missing."
[ -d .git ] || die "Not a Git repository."

NAME="$(node -p "require('./package.json').name")"
[ "$NAME" = "$EXPECTED_NAME" ] || die "Wrong project: $NAME"

printf '✓ Project: %s\n' "$NAME"

# Verify Vercel link if present.
if [ -f .vercel/project.json ]; then
  VERCEL_PROJECT="$(node -p "require('./.vercel/project.json').projectId || ''")"
  printf '✓ Vercel link detected.\n'
fi

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

log "Creating timestamped backup..."

mkdir -p "$BACKUP"

cp -a src "$BACKUP/src"
cp package.json "$BACKUP/package.json"
cp package-lock.json "$BACKUP/package-lock.json"

[ -f tsconfig.json ] && cp tsconfig.json "$BACKUP/tsconfig.json" || true
[ -f next.config.mjs ] && cp next.config.mjs "$BACKUP/next.config.mjs" || true

printf '✓ Backup: %s\n' "$BACKUP"

# ------------------------------------------------------------
# DIRECTORIES
# ------------------------------------------------------------

log "Preparing Sentinel directories..."

mkdir -p   src/lib   src/components   src/app/api/analyze   src/app/api/ai   src/app/api/report   src/app/review   src/app/docs   src/app/pricing

# ------------------------------------------------------------
# SECURITY ENGINE
# ------------------------------------------------------------

log "Installing deep security analysis engine..."

cat > src/lib/security-engine.ts <<'EOF'
export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Finding = {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  line: number;
  category: string;
  cwe: string;
  owasp: string;
  description: string;
  impact: string;
  remediation: string;
  secureExample: string;
  references: string[];
};

type Rule = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  cwe: string;
  owasp: string;
  pattern: RegExp;
  description: string;
  impact: string;
  remediation: string;
  secureExample: string;
};

const RULES: Rule[] = [
  {
    id: "S001",
    title: "Command injection risk",
    severity: "critical",
    category: "Command Injection",
    cwe: "CWE-78",
    owasp: "A03:2021 Injection",
    pattern: /(?:exec|execSync|spawn|system)\s*\([^)]*(?:req\.|request\.|params|query|body|input|user)/i,
    description: "User-controlled input appears to reach an operating-system command execution API.",
    impact: "An attacker may execute arbitrary operating-system commands with the privileges of the application.",
    remediation: "Avoid shell execution with user-controlled strings. Prefer fixed argument arrays and strict allowlists.",
    secureExample: "Use spawn(command, [validatedArg], { shell: false }) with strict validation."
  },
  {
    id: "S002",
    title: "SQL injection risk",
    severity: "critical",
    category: "SQL Injection",
    cwe: "CWE-89",
    owasp: "A03:2021 Injection",
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,180}(?:\+|
