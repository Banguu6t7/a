#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/workspaces/a/saifrvw"

cd "$ROOT"

echo
echo "============================================================"
echo " SAIFRVW — SENTINEL CONTROLLED REPAIR"
echo "============================================================"
echo "ROOT: $(pwd)"
echo

fail() {
  echo
  echo "============================================================"
  echo " REPAIR FAILED"
  echo "============================================================"
  echo "$1"
  exit 1
}

echo "[1/8] Checking project..."

[ -f package.json ] || fail "package.json is missing."
[ -d src ] || fail "src directory is missing."

echo "✓ Project exists"
echo "✓ package.json exists"
echo "✓ src exists"

echo
echo "[2/8] Checking required files..."

FILES=(
  "src/lib/security-engine.ts"
  "src/lib/report-engine.ts"
  "src/app/api/analyze/route.ts"
  "src/app/api/ai/route.ts"
  "src/components/SecurityReport.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "⚠ Missing: $file"
  fi
done

echo
echo "[3/8] Creating backup..."

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.sentinel-repair-$STAMP"

mkdir -p "$BACKUP"

cp -a src "$BACKUP/src"

echo "✓ Backup:"
echo "  $BACKUP"

echo
echo "[4/8] Ensuring dependencies..."

if [ ! -x "./node_modules/.bin/tsc" ] || [ ! -x "./node_modules/.bin/next" ]; then
  echo "Dependencies are incomplete."
  echo "Running npm install..."
  npm install
fi

[ -x "./node_modules/.bin/tsc" ] || fail "TypeScript compiler is unavailable."
[ -x "./node_modules/.bin/next" ] || fail "Next.js CLI is unavailable."

echo "✓ TypeScript available"
echo "✓ Next.js available"

echo
echo "[5/8] Repairing known type contracts..."

python3 <<'PY'
from pathlib import Path
import re

root = Path("/workspaces/a/saifrvw")

# ------------------------------------------------------------
# SECURITY ENGINE
# ------------------------------------------------------------

security = root / "src/lib/security-engine.ts"

if security.exists():
    text = security.read_text()

    # Only add column if Finding has line but no column.
    if re.search(r"\bline\s*:\s*number\s*;", text):
        if not re.search(r"\bcolumn\s*\??\s*:\s*number\s*;", text):
            text, count = re.subn(
                r"(\bline\s*:\s*number\s*;)",
                r"\1\n  column?: number;",
                text,
                count=1,
            )

            if count:
                security.write_text(text)
                print("✓ Added optional Finding.column")
            else:
                print("• Finding.column not changed")
        else:
            print("✓ Finding.column already exists")
    else:
        print("• Could not locate Finding.line automatically")
else:
    print("• security-engine.ts missing")


# ------------------------------------------------------------
# SECURITY REPORT UI
# ------------------------------------------------------------

ui = root / "src/components/SecurityReport.tsx"

if ui.exists():
    text = ui.read_text()

    old = "finding.column"
    new = "(finding.column ?? 1)"

    if old in text and new not in text:
        text = text.replace(old, new)
        ui.write_text(text)
        print("✓ Made Finding.column UI-safe")
    else:
        print("• SecurityReport column usage already safe")
else:
    print("• SecurityReport.tsx missing")


# ------------------------------------------------------------
# REPORT ENGINE
# ------------------------------------------------------------

report = root / "src/lib/report-engine.ts"

if report.exists():
    text = report.read_text()

    changed = False

    # analysis.generatedAt does not exist in the current analysis
    # contract according to the compiler error.
    if "analysis.generatedAt" in text:
        text = text.replace(
            "analysis.generatedAt",
            "new Date().toISOString()"
        )
        changed = True
        print("✓ Replaced invalid analysis.generatedAt")

    # Current analyzer contract does not expose filename.
    if "analysis.filename" in text:
        text = text.replace(
            "analysis.filename",
            '"source-code"'
        )
        changed = True
        print("✓ Replaced invalid analysis.filename")

    if changed:
        report.write_text(text)
    else:
        print("• Report engine required no known contract repair")
else:
    print("• report-engine.ts missing")

PY

echo
echo "[6/8] Running TypeScript..."

if ! ./node_modules/.bin/tsc --noEmit; then
  echo
  echo "TypeScript still has errors."
  echo "Backup remains at:"
  echo "$BACKUP"
  exit 1
fi

echo "✓ TypeScript PASSED"

echo
echo "[7/8] Running ESLint..."

if ! npm run lint; then
  echo
  echo "Lint still has errors."
  echo "Backup remains at:"
  echo "$BACKUP"
  exit 1
fi

echo "✓ ESLint PASSED"

echo
echo "[8/8] Running production build..."

if ! npm run build; then
  echo
  echo "Production build still has errors."
  echo "Backup remains at:"
  echo "$BACKUP"
  exit 1
fi

echo
echo "============================================================"
echo " SAIFRVW — REPAIR SUCCESSFUL"
echo "============================================================"
echo
echo "✓ TypeScript PASSED"
echo "✓ ESLint PASSED"
echo "✓ Next.js production build PASSED"
echo
echo "Backup:"
echo "$BACKUP"
echo
echo "DEPLOYMENT IS NOT AUTOMATIC."
echo "============================================================"
