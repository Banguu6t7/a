#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/workspaces/a/saifrvw"
cd "$ROOT"

echo "============================================================"
echo " SAIFRVW — SENTINEL CONTRACT REPAIR"
echo "============================================================"

[ -f package.json ] || {
  echo "ERROR: package.json not found"
  exit 1
}

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP=".sentinel-contract-backup-$STAMP"

mkdir -p "$BACKUP"

echo
echo "[1/6] Creating backup..."

cp -a src/lib/security-engine.ts "$BACKUP/security-engine.ts" 2>/dev/null || true
cp -a src/lib/report-engine.ts "$BACKUP/report-engine.ts" 2>/dev/null || true
cp -a src/components/SecurityReport.tsx "$BACKUP/SecurityReport.tsx" 2>/dev/null || true
cp -a src/app/api/analyze/route.ts "$BACKUP/analyze-route.ts" 2>/dev/null || true

echo "Backup: $ROOT/$BACKUP"

echo
echo "[2/6] Checking required files..."

for f in \
  src/lib/security-engine.ts \
  src/lib/report-engine.ts \
  src/components/SecurityReport.tsx \
  src/app/api/analyze/route.ts
do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing $f"
    exit 1
  fi
done

echo "✓ Required files exist"

echo
echo "[3/6] Fixing Finding column contract..."

python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/lib/security-engine.ts")
text = p.read_text()

if re.search(r'\bcolumn\s*\??\s*:\s*number', text):
    print("✓ Finding already contains column")
else:
    match = re.search(r'(\bline\s*:\s*number\s*;)', text)

    if not match:
        print("ERROR: Could not locate Finding.line in security-engine.ts")
        raise SystemExit(1)

    text = text[:match.end()] + "\n  column?: number;" + text[match.end():]
    p.write_text(text)
    print("✓ Added optional column?: number")

p = Path("src/components/SecurityReport.tsx")
text = p.read_text()

old = "Line {finding.line}, column {finding.column}"

if old in text:
    text = text.replace(
        old,
        "Line {finding.line}, column {finding.column ?? 1}"
    )
    p.write_text(text)
    print("✓ Added safe column fallback")
else:
    print("✓ SecurityReport column expression already repaired")
PY

echo
echo "[4/6] Fixing report metadata contract..."

python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/lib/report-engine.ts")
text = p.read_text()

changed = False

# generatedAt is not part of the current analyzer result.
text2 = re.sub(
    r'generatedAt:\s*analysis\.generatedAt,',
    'generatedAt: new Date().toISOString(),',
    text
)

if text2 != text:
    changed = True
    text = text2
    print("✓ Replaced analysis.generatedAt with current timestamp")

# filename is also not part of the current analyzer result.
text2 = re.sub(
    r'filename:\s*analysis\.filename,',
    'filename: "source-code",',
    text
)

if text2 != text:
    changed = True
    text = text2
    print("✓ Replaced analysis.filename with safe fallback")

if changed:
    p.write_text(text)
else:
    print("✓ Report metadata already compatible")
PY

echo
echo "[5/6] Checking TypeScript contracts..."

if [ ! -x "./node_modules/.bin/tsc" ]; then
  echo "TypeScript binary missing. Installing project dependencies..."
  npm install
fi

./node_modules/.bin/tsc --noEmit

echo "✓ TypeScript passes"

echo
echo "[6/6] Running lint + production build..."

npm run lint
npm run build

echo
echo "============================================================"
echo " SENTINEL CONTRACT REPAIR PASSED"
echo "============================================================"
echo
echo "✓ Finding contract"
echo "✓ SecurityReport"
echo "✓ Report metadata"
echo "✓ TypeScript"
echo "✓ ESLint"
echo "✓ Production build"
echo
echo "NO DEPLOYMENT WAS PERFORMED."
echo
echo "Backup:"
echo "$ROOT/$BACKUP"
echo
