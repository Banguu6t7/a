#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/workspaces/a/saifrvw"
cd "$ROOT"

echo
echo "============================================================"
echo " SAIFRVW — FINAL CONTRACT + RUNTIME REPAIR"
echo "============================================================"
echo

# ------------------------------------------------------------
# 0. SAFETY
# ------------------------------------------------------------

echo "[0/8] Checking repository..."

[ -f package.json ] || {
  echo "ERROR: package.json not found"
  exit 1
}

[ -d src ] || {
  echo "ERROR: src/ not found"
  exit 1
}

echo "ROOT: $(pwd)"
echo "BRANCH: $(git branch --show-current 2>/dev/null || echo unknown)"
echo

# ------------------------------------------------------------
# 1. REMOVE UNREFERENCED BROKEN COMPONENT
# ------------------------------------------------------------

echo "[1/8] Removing unreferenced AICompanion artifact..."

if [ -f src/components/AICompanion.tsx ]; then
  echo "Found src/components/AICompanion.tsx"

  if grep -RInE \
    'AICompanion|ai-companion|AI Companion' \
    src \
    --include='*.ts' \
    --include='*.tsx' \
    2>/dev/null \
    | grep -v 'src/components/AICompanion.tsx' \
    | grep -q .; then

    echo "ERROR: AICompanion is referenced by application source."
    echo "Refusing to delete it."
    grep -RInE \
      'AICompanion|ai-companion|AI Companion' \
      src \
      --include='*.ts' \
      --include='*.tsx' \
      2>/dev/null || true
    exit 1
  fi

  rm -f src/components/AICompanion.tsx
  echo "✓ Removed unreferenced AICompanion.tsx"
else
  echo "✓ AICompanion.tsx already absent"
fi

if [ -f src/components/SecurityReport.tsx.bak ]; then
  rm -f src/components/SecurityReport.tsx.bak
  echo "✓ Removed backup artifact SecurityReport.tsx.bak"
fi

# ------------------------------------------------------------
# 2. BACKUP CURRENT REVIEW PAGE
# ------------------------------------------------------------

echo
echo "[2/8] Backing up current ReviewPage..."

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP=".review-page-before-final-repair-$STAMP.tsx"

cp src/app/review/page.tsx "$BACKUP"

echo "✓ Backup: $BACKUP"

# ------------------------------------------------------------
# 3. PATCH REVIEW PAGE USING PYTHON
# ------------------------------------------------------------

echo
echo "[3/8] Repairing ReviewPage contracts..."

python3 <<'PY'
from pathlib import Path

path = Path("src/app/review/page.tsx")
text = path.read_text()

# ------------------------------------------------------------
# Replace Result type
# ------------------------------------------------------------

start = text.find("type Result = {")
if start == -1:
    raise SystemExit("ERROR: Could not find 'type Result = {'")

end = text.find("\n};", start)
if end == -1:
    raise SystemExit("ERROR: Could not find end of Result type")

end += len("\n};")

new_result_type = '''type Result = {
  findings: Finding[];
  riskScore: number;
  securityGrade: string;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  scannedLines: number;
  engine: string;
  language: string;
};'''

text = text[:start] + new_result_type + text[end:]

# ------------------------------------------------------------
# Replace analyze()
# ------------------------------------------------------------

start = text.find("async function analyze()")
if start == -1:
    raise SystemExit("ERROR: Could not find analyze()")

end = text.find("\nasync function askAI", start)
if end == -1:
    raise SystemExit("ERROR: Could not find askAI() after analyze()")

new_analyze = '''async function analyze() {
  setLoading(true);
  setAiAnswer("");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    if (!data.analysis) {
      throw new Error("Analyzer returned an invalid response.");
    }

    const analysis = data.analysis;

    if (
      !Array.isArray(analysis.findings) ||
      typeof analysis.riskScore !== "number" ||
      typeof analysis.securityGrade !== "string" ||
      !analysis.counts
    ) {
      throw new Error("Analyzer returned an unexpected response shape.");
    }

    setResult(analysis);
    setSelected(analysis.findings[0] || null);
  } catch (error) {
    alert(error instanceof Error ? error.message : "Analysis failed.");
  } finally {
    setLoading(false);
  }
}
'''

text = text[:start] + new_analyze + text[end:]

# ------------------------------------------------------------
# Replace askAI()
# ------------------------------------------------------------

start = text.find("async function askAI(action: string)")
if start == -1:
    raise SystemExit("ERROR: Could not find askAI()")

end = text.find("\nconst report =", start)
if end == -1:
    raise SystemExit("ERROR: Could not find report useMemo after askAI()")

new_ask_ai = '''async function askAI(action: string) {
  if (!selected) return;

  setAiLoading(true);
  setAiAnswer("");

  try {
    const message = [
      action,
      "",
      "Selected security finding:",
      `Title: ${selected.title}`,
      `Severity: ${selected.severity}`,
      `Description: ${selected.description}`,
      `Evidence: ${selected.evidence}`,
      `Remediation: ${selected.remediation}`,
    ].join("\\n");

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        code,
        language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed.");
    }

    if (typeof data.answer !== "string") {
      throw new Error("AI endpoint returned an invalid response.");
    }

    setAiAnswer(data.answer);
  } catch (error) {
    setAiAnswer(
      error instanceof Error ? error.message : "AI assistant unavailable."
    );
  } finally {
    setAiLoading(false);
  }
}
'''

text = text[:start] + new_ask_ai + text[end:]

# ------------------------------------------------------------
# Replace report useMemo
# ------------------------------------------------------------

start = text.find("const report = useMemo(() =>")
if start == -1:
    raise SystemExit("ERROR: Could not find report useMemo()")

end = text.find("\n}, [result]);", start)
if end == -1:
    raise SystemExit("ERROR: Could not find end of report useMemo()")

end += len("\n}, [result]);")

new_report = '''const report = useMemo(() => {
  if (!result) return "";

  return JSON.stringify(
    {
      product: "SAIFRVW",
      engine: result.engine || "SENTINEL ENGINE",
      generatedAt: new Date().toISOString(),
      riskScore: result.riskScore,
      securityGrade: result.securityGrade,
      counts: result.counts,
      scannedLines: result.scannedLines,
      language: result.language,
      findings: result.findings,
    },
    null,
    2
  );
}, [result]);'''

text = text[:start] + new_report + text[end:]

# ------------------------------------------------------------
# Replace metric section
# ------------------------------------------------------------

old_metrics = '''{result && (
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric
          label="Risk Score"
          value={`${result.risk.score}/100`}
        />
        <Metric label="Grade" value={result.risk.grade} />
        <Metric
          label="Critical"
          value={String(result.risk.critical)}
        />
        <Metric label="High" value={String(result.risk.high)} />
        <Metric
          label="Findings"
          value={String(result.summary.totalFindings)}
        />
      </div>
    )}'''

new_metrics = '''{result && (
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric
          label="Risk Score"
          value={`${result.riskScore}/100`}
        />
        <Metric
          label="Grade"
          value={result.securityGrade}
        />
        <Metric
          label="Critical"
          value={String(result.counts.critical)}
        />
        <Metric
          label="High"
          value={String(result.counts.high)}
        />
        <Metric
          label="Findings"
          value={String(result.findings.length)}
        />
      </div>
    )}'''

if old_metrics in text:
    text = text.replace(old_metrics, new_metrics, 1)
else:
    print("WARNING: Exact metric block was not found.")
    print("Checking for stale result.risk/result.summary references later.")

path.write_text(text)
print("✓ ReviewPage contract repair written")
PY

# ------------------------------------------------------------
# 4. VERIFY STALE CONTRACTS ARE GONE
# ------------------------------------------------------------

echo
echo "[4/8] Checking for stale ReviewPage contracts..."

if grep -nE \
  'result\.risk\.|result\.summary\.|setResult\(data\)|setSelected\(data\.findings' \
  src/app/review/page.tsx \
  2>/dev/null; then

  echo
  echo "ERROR: Stale API/UI contract references remain."
  echo "ReviewPage was backed up as:"
  echo "$BACKUP"
  exit 1
fi

echo "✓ No stale result.risk/result.summary contracts found"
echo "✓ No setResult(data) wrapper bug found"

echo
echo "Current AI request:"
grep -n -A18 'async function askAI' src/app/review/page.tsx || true

echo
echo "Current analyzer response handling:"
grep -n -A35 'async function analyze' src/app/review/page.tsx || true

# ------------------------------------------------------------
# 5. CHECK SOURCE REFERENCES
# ------------------------------------------------------------

echo
echo "[5/8] Checking source references..."

if grep -RInE \
  'AICompanion|ai-companion|AI Companion' \
  src \
  --include='*.ts' \
  --include='*.tsx' \
  2>/dev/null; then

  echo "ERROR: Unexpected AICompanion reference remains."
  exit 1
else
  echo "✓ No AICompanion application references"
fi

echo
echo "SecurityReport references:"
grep -RInE \
  'SecurityReport' \
  src \
  --include='*.ts' \
  --include='*.tsx' \
  2>/dev/null || true

# ------------------------------------------------------------
# 6. CLEAN PRODUCTION BUILD
# ------------------------------------------------------------

echo
echo "[6/8] Running clean production build..."

rm -rf .next

npm run build

echo
echo "============================================================"
echo " BUILD PASSED"
echo "============================================================"

# ------------------------------------------------------------
# 7. START REAL PRODUCTION SERVER
# ------------------------------------------------------------

echo
echo "[7/8] Starting production server..."

# Kill only an existing process listening on our target port.
if command -v lsof >/dev/null 2>&1; then
  EXISTING_PID="$(lsof -ti :3000 2>/dev/null || true)"

  if [ -n "$EXISTING_PID" ]; then
    echo "Stopping existing port 3000 process: $EXISTING_PID"
    kill "$EXISTING_PID" 2>/dev/null || true
    sleep 2
  fi
fi

SERVER_LOG="/tmp/saifrvw-production.log"
rm -f "$SERVER_LOG"

npm run start -- -H 0.0.0.0 >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"

cleanup() {
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

echo "Waiting for server..."

READY=0

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/ >/dev/null 2>&1; then
    READY=1
    break
  fi

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo
    echo "ERROR: Production server exited."
    echo
    cat "$SERVER_LOG"
    exit 1
  fi

  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo
  echo "ERROR: Server did not become ready."
  echo
  cat "$SERVER_LOG"
  exit 1
fi

echo "✓ Production server is responding"

# ------------------------------------------------------------
# 8. RUNTIME TESTS
# ------------------------------------------------------------

echo
echo "[8/8] Running runtime endpoint tests..."

echo
echo "===== GET / ====="
ROOT_STATUS="$(curl -sS -o /tmp/saifrvw-root.html -w '%{http_code}' http://127.0.0.1:3000/)"
echo "HTTP $ROOT_STATUS"

if [ "$ROOT_STATUS" != "200" ]; then
  echo "ERROR: Homepage failed."
  exit 1
fi

echo "✓ Homepage OK"

echo
echo "===== GET /review ====="
REVIEW_STATUS="$(curl -sS -o /tmp/saifrvw-review.html -w '%{http_code}' http://127.0.0.1:3000/review)"
echo "HTTP $REVIEW_STATUS"

if [ "$REVIEW_STATUS" != "200" ]; then
  echo "ERROR: Review page failed."
  exit 1
fi

echo "✓ Review page OK"

echo
echo "===== POST /api/analyze ====="

ANALYZE_RESPONSE="$(
  curl -sS \
    -X POST \
    http://127.0.0.1:3000/api/analyze \
    -H 'Content-Type: application/json' \
    --data '{"code":"const query = \"SELECT * FROM users WHERE id = \" + userId;","language":"javascript"}'
)"

echo "$ANALYZE_RESPONSE"

python3 - "$ANALYZE_RESPONSE" <<'PY'
import json
import sys

data = json.loads(sys.argv[1])

assert data.get("ok") is True, f"Unexpected ok: {data}"
assert isinstance(data.get("analysis"), dict), "Missing analysis object"

analysis = data["analysis"]

assert isinstance(analysis.get("findings"), list), "findings is not an array"
assert isinstance(analysis.get("riskScore"), (int, float)), "riskScore missing"
assert isinstance(analysis.get("securityGrade"), str), "securityGrade missing"
assert isinstance(analysis.get("counts"), dict), "counts missing"

print("✓ /api/analyze returned the expected contract")
print(f"  findings: {len(analysis['findings'])}")
print(f"  riskScore: {analysis['riskScore']}")
print(f"  securityGrade: {analysis['securityGrade']}")
print(f"  counts: {analysis['counts']}")
PY

echo
echo "===== POST /api/ai ====="

AI_RESPONSE="$(
  curl -sS \
    -X POST \
    http://127.0.0.1:3000/api/ai \
    -H 'Content-Type: application/json' \
    --data '{"message":"Explain the highest risk issue and how to fix it.","code":"const query = \"SELECT * FROM users WHERE id = \" + userId;","language":"javascript"}'
)"

echo "$AI_RESPONSE"

python3 - "$AI_RESPONSE" <<'PY'
import json
import sys

data = json.loads(sys.argv[1])

assert data.get("ok") is True, f"Unexpected AI response: {data}"
assert isinstance(data.get("answer"), str), "AI answer missing"

print("✓ /api/ai returned a valid answer")
print(f"  provider: {data.get('provider')}")
print(f"  answer length: {len(data['answer'])}")
PY

echo
echo "===== SERVER LOG ====="
cat "$SERVER_LOG"

echo
echo "============================================================"
echo " SAIFRVW — REPAIR SUCCESSFUL"
echo "============================================================"
echo
echo "✓ Dependencies were not changed"
echo "✓ Unreferenced AICompanion removed"
echo "✓ ReviewPage API contract repaired"
echo "✓ AI request contract repaired"
echo "✓ Production build passed"
echo "✓ Production server started"
echo "✓ / returned HTTP 200"
echo "✓ /review returned HTTP 200"
echo "✓ /api/analyze contract verified"
echo "✓ /api/ai contract verified"
echo
echo "LOCAL SERVER: http://127.0.0.1:3000"
echo
echo "IMPORTANT:"
echo "The server will remain running only until this script exits."
echo "For deployment, run the deployment command separately after"
echo reviewing the successful test results."
echo
