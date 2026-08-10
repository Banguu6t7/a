#!/usr/bin/env bash
set -Eeuo pipefail

REPO="/workspaces/a"
APP="$REPO/saifrvw"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

log()  { echo -e "${CYAN}▶${RESET} $*"; }
ok()   { echo -e "${GREEN}✓${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠${RESET} $*"; }
die()  { echo -e "${RED}✗${RESET} $*"; exit 1; }

echo
echo "============================================================"
echo "        SAIFRVW — FINAL VERCEL DEPLOYMENT"
echo "============================================================"
echo

[[ -d "$REPO/.git" ]] || die "Git repository not found: $REPO"
[[ -f "$APP/package.json" ]] || die "Next.js package.json not found: $APP/package.json"
[[ -f "$APP/next.config.mjs" ]] || die "next.config.mjs not found."
[[ -d "$APP/src/app" ]] || die "src/app directory not found."

ok "Repository: $REPO"
ok "Application: $APP"

echo
log "Cleaning stale editor artifacts..."

rm -f "$REPO/.sentinel_update_v32.sh.swp"
rm -f "$REPO/sentinel_update_v32.sh"
rm -f "$REPO/sentinel_deploy_v40.sh"
rm -f "$REPO/deploy_saifrvw.sh"

ok "Temporary artifacts cleaned."

echo
log "Reading application configuration..."

node - <<'NODE'
const fs = require('/workspaces/a/saifrvw/package.json');

console.log("Name    :", fs.name);
console.log("Version :", fs.version);
console.log("Next    :", fs.dependencies?.next || "unknown");
console.log("React   :", fs.dependencies?.react || "unknown");
console.log("Build   :", fs.scripts?.build || "missing");
console.log("Start   :", fs.scripts?.start || "missing");
NODE

echo
log "Installing locked dependencies..."

cd "$APP"
npm install

ok "Dependencies installed."

echo
log "Running lint..."

if npm run lint; then
    ok "Lint passed."
else
    die "Lint failed."
fi

echo
log "Running production build..."

if npm run build; then
    ok "Production build passed."
else
    die "Production build failed."
fi

echo
log "Checking Vercel authentication..."

if npx vercel whoami >/dev/null 2>&1; then
    USER="$(npx vercel whoami 2>/dev/null || true)"
    ok "Vercel authenticated: $USER"
else
    die "Vercel is not authenticated. Run: npx vercel login"
fi

echo
log "Returning to Git repository root..."

cd "$REPO"

echo
log "Removing old local Vercel link..."

rm -rf "$APP/.vercel"

ok "Old local Vercel metadata removed."

echo
echo "============================================================"
echo " IMPORTANT VERCEL CONFIGURATION"
echo "============================================================"
echo
echo "Git repository root:"
echo "  $REPO"
echo
echo "Next.js application:"
echo "  saifrvw"
echo
echo "Vercel Root Directory MUST be:"
echo "  saifrvw"
echo
echo "NOT:"
echo "  ./saifrvw"
echo "  /workspaces/a/saifrvw"
echo "  ../saifrvw"
echo

log "Linking from repository root..."

npx vercel link --yes --repo

echo
ok "Vercel project linked."

echo
log "Inspecting local Vercel metadata..."

if [[ -f "$APP/.vercel/project.json" ]]; then
    cat "$APP/.vercel/project.json"
elif [[ -f "$REPO/.vercel/project.json" ]]; then
    cat "$REPO/.vercel/project.json"
else
    warn "No local project.json found. Continuing."
fi

echo
echo "============================================================"
echo " DEPLOYMENT"
echo "============================================================"
echo

log "Deploying SAIFRVW to production..."

npx vercel --prod --yes

echo
echo "============================================================"
echo "              DEPLOYMENT COMPLETE"
echo "============================================================"
echo
ok "SAIFRVW production deployment finished."
echo
echo "If Vercel printed a Production URL above, open that URL."
echo
