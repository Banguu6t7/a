#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# SAIFRVW — SAFE CLEANUP + PRODUCTION DEPLOY
# TARGET: ONLY VERCEL PROJECT "saifrvw"
#
# WILL NEVER DEPLOY TO:
#   - saifrvuwe
#   - a
#
# It also refuses to continue if Vercel tries to target
# anything other than "saifrvw".
# ============================================================

REPO="/workspaces/a"
APP="$REPO/saifrvw"
TARGET_PROJECT="saifrvw"
FORBIDDEN_1="saifrvuwe"
FORBIDDEN_2="a"

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
echo "       SAIFRVW — SAFE PRODUCTION DEPLOY"
echo "============================================================"
echo
echo "Target project : $TARGET_PROJECT"
echo "Application    : $APP"
echo "Forbidden      : $FORBIDDEN_1, $FORBIDDEN_2"
echo

# ------------------------------------------------------------
# HARD SAFETY CHECKS
# ------------------------------------------------------------

[[ "$(pwd)" == "$REPO" ]] || {
    cd "$REPO"
}

[[ -d "$REPO/.git" ]] || die "Git repository not found: $REPO"
[[ -d "$APP" ]] || die "Application directory not found: $APP"
[[ -f "$APP/package.json" ]] || die "package.json not found."
[[ -f "$APP/next.config.mjs" ]] || die "next.config.mjs not found."

ok "Repository detected."
ok "SAIFRVW application detected."

# ------------------------------------------------------------
# VERIFY PACKAGE
# ------------------------------------------------------------

cd "$APP"

PACKAGE_NAME="$(node -p "require('./package.json').name")"
NEXT_VERSION="$(node -p "require('./package.json').dependencies?.next || require('./package.json').devDependencies?.next || 'unknown'")"

[[ "$PACKAGE_NAME" == "saifrvw" ]] ||     die "Safety stop: package.json name is '$PACKAGE_NAME', not 'saifrvw'."

ok "Package identity confirmed: $PACKAGE_NAME"
ok "Next.js version: $NEXT_VERSION"

# ------------------------------------------------------------
# CLEAN ONLY LOCAL VERCEL METADATA
# ------------------------------------------------------------

log "Removing local Vercel metadata..."

rm -rf "$APP/.vercel"

ok "Local .vercel metadata removed."

# ------------------------------------------------------------
# CHECK VERCEL AUTH
# ------------------------------------------------------------

log "Checking Vercel authentication..."

if ! npx vercel whoami >/tmp/saifrvw-vercel-user.txt 2>&1; then
    cat /tmp/saifrvw-vercel-user.txt
    die "Vercel authentication failed. Run: npx vercel login"
fi

VERCEL_USER="$(tail -n 1 /tmp/saifrvw-vercel-user.txt || true)"

ok "Vercel authentication available."
echo "Account: $VERCEL_USER"

# ------------------------------------------------------------
# INSTALL DEPENDENCIES
# ------------------------------------------------------------

log "Installing locked dependencies..."

if [[ -f package-lock.json ]]; then
    npm ci
else
    npm install
fi

ok "Dependencies installed."

# ------------------------------------------------------------
# LINT
# ------------------------------------------------------------

if npm run lint --if-present; then
    ok "Lint passed."
else
    die "Lint failed."
fi

# ------------------------------------------------------------
# PRODUCTION BUILD
# ------------------------------------------------------------

log "Running production build..."

npm run build

ok "Production build passed."

# ------------------------------------------------------------
# LINK ONLY TO EXISTING SAIFRVW PROJECT
# ------------------------------------------------------------

log "Linking ONLY to Vercel project: $TARGET_PROJECT"

LINK_OUTPUT="$(mktemp)"

set +e
npx vercel link     --yes     --project "$TARGET_PROJECT"     >"$LINK_OUTPUT" 2>&1
LINK_STATUS=$?
set -e

cat "$LINK_OUTPUT"

if [[ "$LINK_STATUS" -ne 0 ]]; then
    rm -f "$LINK_OUTPUT"
    die "Could not link to existing Vercel project '$TARGET_PROJECT'."
fi

rm -f "$LINK_OUTPUT"

# ------------------------------------------------------------
# VERIFY LOCAL PROJECT LINK
# ------------------------------------------------------------

[[ -f "$APP/.vercel/project.json" ]] ||     die "Vercel did not create .vercel/project.json."

PROJECT_JSON="$APP/.vercel/project.json"

PROJECT_NAME="$(node - <<'NODE'
const fs = require('./.vercel/project.json');
console.log(fs.projectName || fs.name || '');
NODE
)"

PROJECT_ID="$(node - <<'NODE'
const fs = require('./.vercel/project.json');
console.log(fs.projectId || '');
NODE
)"

echo
echo "Vercel project metadata:"
cat "$PROJECT_JSON"
echo

# ------------------------------------------------------------
# HARD PROJECT NAME LOCK
# ------------------------------------------------------------

if [[ "$PROJECT_NAME" != "$TARGET_PROJECT" ]]; then
    die "SAFETY STOP: Vercel linked project is '$PROJECT_NAME'. Expected '$TARGET_PROJECT'."
fi

if [[ "$PROJECT_NAME" == "$FORBIDDEN_1" ]]; then
    die "SAFETY STOP: Refusing to deploy to saifrvuwe."
fi

if [[ "$PROJECT_NAME" == "$FORBIDDEN_2" ]]; then
    die "SAFETY STOP: Refusing to deploy to project 'a'."
fi

ok "Vercel project verified: $PROJECT_NAME"

# ------------------------------------------------------------
# VERIFY ROOT DIRECTORY
# ------------------------------------------------------------

ROOT_DIR="$(node - <<'NODE'
const fs = require('./.vercel/project.json');
console.log(fs.rootDirectory || '');
NODE
)"

echo "Local Root Directory: ${ROOT_DIR:-<not defined>}"

# IMPORTANT:
# Because we're deploying from the actual Next.js application
# directory, we do NOT allow ../ or ./ style root paths here.

if [[ "$ROOT_DIR" == ../* || "$ROOT_DIR" == ./* ]]; then
    die "Invalid Vercel Root Directory detected: '$ROOT_DIR'"
fi

# ------------------------------------------------------------
# DEPLOY ONLY THE EXISTING PROJECT
# ------------------------------------------------------------

echo
echo "============================================================"
echo " SAFETY CHECK PASSED"
echo "============================================================"
echo
echo "Vercel project : $PROJECT_NAME"
echo "Project ID     : $PROJECT_ID"
echo "App directory  : $APP"
echo
echo "Allowed target : saifrvw"
echo "Blocked target : saifrvuwe"
echo "Blocked target : a"
echo

read -r -p "Deploy SAIFRVW to production? [y/N] " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo
    warn "Deployment cancelled."
    exit 0
fi

# ------------------------------------------------------------
# FINAL COMMAND
# ------------------------------------------------------------

log "Deploying existing SAIFRVW project to production..."

DEPLOY_OUTPUT="$(mktemp)"

set +e
npx vercel --prod --yes >"$DEPLOY_OUTPUT" 2>&1
DEPLOY_STATUS=$?
set -e

cat "$DEPLOY_OUTPUT"

# ------------------------------------------------------------
# FINAL SAFETY CHECK
# ------------------------------------------------------------

if [[ "$DEPLOY_STATUS" -ne 0 ]]; then
    rm -f "$DEPLOY_OUTPUT"
    echo
    die "Deployment failed."
fi

if grep -Eiq 'saifrvuwe|project.*[[:space:]]a([^a-zA-Z]|$)' "$DEPLOY_OUTPUT"; then
    rm -f "$DEPLOY_OUTPUT"
    die "SAFETY STOP: Deployment output referenced a forbidden project."
fi

rm -f "$DEPLOY_OUTPUT"

echo
echo "============================================================"
echo "       SAIFRVW DEPLOYMENT COMPLETE"
echo "============================================================"
echo
echo "Target : saifrvw"
echo
echo "Open your production site:"
echo
echo "https://saifrvw.vercel.app"
echo
echo "============================================================"
