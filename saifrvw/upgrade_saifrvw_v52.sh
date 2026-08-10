#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/workspaces/a/saifrvw"
cd "$ROOT"

echo "============================================================"
echo " SAIFRVW v5.2 — PRODUCT UPGRADE"
echo "============================================================"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP=".saifrvw-v52-backup-$STAMP"

echo
echo "[1/8] Creating backup..."

mkdir -p "$BACKUP"

cp -a src "$BACKUP/src"
cp package.json "$BACKUP/package.json"
cp package-lock.json "$BACKUP/package-lock.json"

echo "✓ Backup: $BACKUP"

echo
echo "[2/8] Creating SAIFRVW brand assets..."

mkdir -p public

cat > public/favicon.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#818cf8"/>
      <stop offset=".55" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>

  <rect width="128" height="128" rx="28" fill="#08080f"/>

  <path
    d="M64 15 104 30v31c0 25-17 42-40 52C41 103 24 86 24 61V30Z"
    fill="none"
    stroke="url(#g)"
    stroke-width="7"
  />

  <path
    d="m42 64 14 14 31-34"
    fill="none"
    stroke="url(#g)"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
SVG

cat > public/saifrvw-mark.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#818cf8"/>
      <stop offset=".55" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>

  <rect width="128" height="128" rx="28" fill="#08080f"/>

  <path
    d="M64 15 104 30v31c0 25-17 42-40 52C41 103 24 86 24 61V30Z"
    fill="none"
    stroke="url(#g)"
    stroke-width="7"
  />

  <path
    d="m42 64 14 14 31-34"
    fill="none"
    stroke="url(#g)"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
SVG

echo "✓ Logo created"
echo "✓ Favicon created"

echo
echo "[3/8] Adding contact + brand metadata..."

python3 <<'PY'
from pathlib import Path

p = Path("src/app/layout.tsx")
s = p.read_text()

# Replace only obvious generic branding strings.
for old in [
    "Create New App",
    "Create new app",
    "create new app",
]:
    s = s.replace(old, "SAIFRVW")

# Add favicon if not already referenced.
if "/favicon.svg" not in s:
    if "<head>" in s:
        s = s.replace(
            "<head>",
            '<head><link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
            1,
        )

p.write_text(s)

print("✓ layout inspected/updated")
PY

echo
echo "[4/8] Updating homepage branding safely..."

python3 <<'PY'
from pathlib import Path

p = Path("src/app/page.tsx")

if p.exists():
    s = p.read_text()

    for old in [
        "Create New App",
        "Create new app",
        "create new app",
    ]:
        s = s.replace(old, "SAIFRVW")

    p.write_text(s)
    print("✓ homepage branding updated")
else:
    print("⚠ homepage missing; skipped")
PY

echo
echo "[5/8] Replacing repetitive AI response logic..."

python3 <<'PY'
from pathlib import Path

p = Path("src/app/api/ai/route.ts")

s = p.read_text()

start = s.find("const answer = analysis")
end = s.find("return NextResponse.json({", start)

if start == -1 or end == -1:
    raise SystemExit(
        "ERROR: Could not locate the existing AI answer block safely. "
        "No AI route changes were made."
    )

replacement = r'''const findings = analysis?.findings ?? [];

const severityRank: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const sortedFindings = [...findings].sort(
  (a, b) =>
    (severityRank[b.severity] ?? 0) -
    (severityRank[a.severity] ?? 0)
);

const top = sortedFindings[0];

const question = message.toLowerCase();

let answer: string;

if (!analysis || !findings.length) {
  const cleanResponses = [
    `Sentinel scanned the supplied ${language} code and found no matching vulnerabilities in the current rule set. That is a clean scan result, but it is not a guarantee that the application is completely secure.`,
    `The current Sentinel rules did not detect a vulnerability in this ${language} sample. I would still review authentication, authorization, input validation, secrets, dependencies, and business logic.`,
    `No rule-based security findings were triggered by this sample. The code should still receive broader security testing before being considered production-safe.`,
  ];

  answer =
    cleanResponses[message.length % cleanResponses.length];
} else if (
  question.includes("fix") ||
  question.includes("solve") ||
  question.includes("remediat") ||
  question.includes("how")
) {
  answer = [
    `The highest-priority issue is ${top.title}, rated ${top.severity}.`,
    `It was detected around line ${top.line} with ${top.confidence}% confidence.`,
    `Why it matters: ${top.impact}`,
    `Recommended remediation: ${top.remediation}`,
    top.secureExample
      ? `Safer example: ${top.secureExample}`
      : "",
    `After applying the change, run Sentinel again and verify that ${top.id} disappears from the findings.`,
  ]
    .filter(Boolean)
    .join(" ");
} else if (
  question.includes("explain") ||
  question.includes("why") ||
  question.includes("danger")
) {
  answer = [
    `${top.title} is classified as ${top.severity} severity.`,
    `Sentinel detected it with ${top.confidence}% confidence at line ${top.line}.`,
    `Category: ${top.category}.`,
    `Potential impact: ${top.impact}`,
    `The relevant evidence is: ${top.evidence}`,
    `Recommended fix: ${top.remediation}`,
  ].join(" ");
} else if (
  question.includes("highest") ||
  question.includes("risk") ||
  question.includes("priority")
) {
  answer = [
    `Your highest-risk finding is ${top.title}.`,
    `Severity: ${top.severity}.`,
    `Confidence: ${top.confidence}%.`,
    `Line: ${top.line}.`,
    `CWE: ${top.cwe}.`,
    `Recommended action: ${top.remediation}`,
  ].join(" ");
} else {
  const responses = [
    `I found ${findings.length} security issue(s). The highest-priority one is ${top.title} at line ${top.line}.`,
    `Sentinel identified ${findings.length} finding(s). The main concern is ${top.title}, rated ${top.severity}.`,
    `The scan's most important issue is ${top.title}. Its potential impact is ${top.impact}`,
  ];

  answer =
    responses[message.length % responses.length] +
    ` ${top.remediation}`;
}

'''

s = s[:start] + replacement + s[end:]

p.write_text(s)

print("✓ AI response engine upgraded")
PY

echo
echo "[6/8] Adding visible contact information to the pricing page if present..."

python3 <<'PY'
from pathlib import Path

p = Path("src/app/pricing/page.tsx")

if not p.exists():
    print("⚠ pricing page not found; skipped")
    raise SystemExit(0)

s = p.read_text()

if "saifantazeem936@gmail.com" not in s:
    s += """

{/* SAIFRVW support/contact */}
<div className="mt-10 text-center text-sm text-slate-500">
  Questions or feedback?{" "}
  <a
    href="mailto:saifantazeem936@gmail.com"
    className="text-indigo-400 hover:text-indigo-300"
  >
    saifantazeem936@gmail.com
  </a>
</div>
"""

    p.write_text(s)
    print("✓ contact email added to pricing page")
else:
    print("✓ contact email already present")
PY

echo
echo "[7/8] Production verification..."

rm -rf .next

npm run build

echo
echo "✓ BUILD PASSED"

echo
echo "Starting temporary production server..."

PORT=3000 npm run start -- -H 127.0.0.1 \
  > /tmp/saifrvw-v52.log 2>&1 &

SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}

trap cleanup EXIT

sleep 5

ROOT_STATUS="$(
  curl -s -o /dev/null \
  -w '%{http_code}' \
  http://127.0.0.1:3000/
)"

REVIEW_STATUS="$(
  curl -s -o /dev/null \
  -w '%{http_code}' \
  http://127.0.0.1:3000/review
)"

echo "/       -> HTTP $ROOT_STATUS"
echo "/review -> HTTP $REVIEW_STATUS"

[ "$ROOT_STATUS" = "200" ] || {
  echo "ERROR: homepage failed"
  cat /tmp/saifrvw-v52.log
  exit 1
}

[ "$REVIEW_STATUS" = "200" ] || {
  echo "ERROR: review failed"
  cat /tmp/saifrvw-v52.log
  exit 1
}

echo
echo "Testing analyzer..."

ANALYZE="$(
  curl -sS -X POST \
    http://127.0.0.1:3000/api/analyze \
    -H 'Content-Type: application/json' \
    --data '{"code":"function test(x) { eval(x); }","language":"javascript"}'
)"

echo "$ANALYZE" | head -c 1000
echo

echo "$ANALYZE" | grep -q '"analysis"' || {
  echo "ERROR: analyze API failed"
  exit 1
}

echo "✓ Analyze API passed"

echo
echo "Testing contextual AI..."

AI="$(
  curl -sS -X POST \
    http://127.0.0.1:3000/api/ai \
    -H 'Content-Type: application/json' \
    --data '{"message":"How do I fix the highest risk issue?","code":"function test(x) { eval(x); }","language":"javascript"}'
)"

echo "$AI" | head -c 1400
echo

echo "$AI" | grep -q '"answer"' || {
  echo "ERROR: AI API failed"
  exit 1
}

echo "$AI" | grep -q 'Dynamic code execution' || {
  echo "ERROR: AI did not reference the actual finding"
  exit 1
}

echo "✓ Contextual AI passed"

echo
echo "[8/8] Deploying production..."

npx vercel deploy --prod --yes

echo
echo "============================================================"
echo " SAIFRVW v5.2 — DEPLOYMENT COMPLETE"
echo "============================================================"
echo
echo "Live:"
echo "https://saifrvw.vercel.app"
echo
echo "Review:"
echo "https://saifrvw.vercel.app/review"
echo
echo "Contact:"
echo "saifantazeem936@gmail.com"
echo
echo "Logo:"
echo "https://saifrvw.vercel.app/saifrvw-mark.svg"
echo
echo "Backup:"
echo "$BACKUP"
echo
echo "============================================================"
