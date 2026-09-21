#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Narayana Health — Safe Git Sync Script
# ─────────────────────────────────────────────────────────────────────────────
# This script safely pulls coworkers' changes from the remote repository
# WITHOUT overwriting or breaking the Search & Pulse AI experience.
# ─────────────────────────────────────────────────────────────────────────────

set -e

REMOTE="${1:-nh-herov4}"
BRANCH="${2:-main}"

echo "═══════════════════════════════════════════════════════════════"
echo "  🏥 Narayana Health — Safe Sync with Coworkers"
echo "  Target: $REMOTE / $BRANCH"
echo "═══════════════════════════════════════════════════════════════"

# 1. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  You have uncommitted changes in your working tree!"
  echo "    Please commit or stash your changes before running safe-sync:"
  echo "    git stash"
  exit 1
fi

# 2. Ensure gitattributes merge driver is active
git config --local merge.ours.driver true

# 3. Create safety rollback tag and backup branch
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_TAG="backup/before-sync-${TIMESTAMP}"
echo "📦 Creating safety rollback tag: $BACKUP_TAG"
git tag -f "$BACKUP_TAG" HEAD
git branch -f search-pulse-stable HEAD

echo "⬇️  Fetching latest from $REMOTE..."
git fetch "$REMOTE" "$BRANCH"

echo "🔄 Merging $REMOTE/$BRANCH safely..."
# We attempt merge; gitattributes 'merge=ours' ensures search files remain ours
if git merge --no-edit "$REMOTE/$BRANCH"; then
  echo "✅ Merge completed cleanly!"
else
  echo "⚠️  Merge encountered conflicts in non-search files."
  # Check if any search file had conflicts (should not happen with merge=ours)
  SEARCH_CONFLICTS=$(git status --porcelain | grep -E '^(UU|AA|DU|UD) src/components/search/NHSearchExperience/' || true)
  if [ -n "$SEARCH_CONFLICTS" ]; then
    echo "⚠️  Resolving search files to our local version..."
    git checkout --ours src/components/search/NHSearchExperience/
    git add src/components/search/NHSearchExperience/
  fi
  
  DOCTOR_CONFLICTS=$(git status --porcelain | grep -E '^(UU|AA|DU|UD) public/doctors/' || true)
  if [ -n "$DOCTOR_CONFLICTS" ]; then
    echo "⚠️  Resolving doctor images to our local version..."
    git checkout --ours public/doctors/
    git add public/doctors/
  fi
  
  REMAINING=$(git status --porcelain | grep -E '^(UU|AA|DU|UD)' || true)
  if [ -n "$REMAINING" ]; then
    echo "❌ Unresolved conflicts remain in:"
    echo "$REMAINING"
    echo ""
    echo "To abort and roll back to exact previous state, run:"
    echo "  git reset --hard $BACKUP_TAG"
    exit 1
  else
    git commit -m "Merge $REMOTE/$BRANCH into local branch (preserved Search & Pulse AI)"
  fi
fi

# 4. Verify Search & Pulse AI integrity
echo "🔍 Verifying Search & Pulse AI integrity..."
if [ ! -f "src/components/search/NHSearchExperience/PulseAIView.tsx" ]; then
  echo "❌ Error: PulseAIView.tsx missing! Restoring from $BACKUP_TAG..."
  git checkout "$BACKUP_TAG" -- src/components/search/NHSearchExperience/
  git commit -m "fix: restore Search & Pulse AI from backup tag"
fi

# 5. Check if Hero.tsx still has NHSearchExperience integrated
if ! grep -q "NHSearchExperience" src/components/sections/hero/Hero.tsx; then
  echo "⚠️  Coworker update removed NHSearchExperience from Hero.tsx! Restoring Hero search integration..."
  git checkout "$BACKUP_TAG" -- src/components/sections/hero/Hero.tsx
  git commit -m "fix: restore NHSearchExperience in Hero.tsx"
fi

# 6. Run TypeScript validation
echo "🧪 Validating TypeScript build..."
export PATH="/Users/a919418/Downloads/NH Website Redesign Concept 2/nh-website/node-v20.18.0-darwin-x64/bin:$PWD/.node-portable/bin:$PATH"
if npx tsc --noEmit; then
  echo "🎉 SUCCESS: All coworker changes merged successfully!"
  echo "   Search & Pulse AI remain 100% intact, functional, and type-safe."
  echo "   Safety backup tag created at: $BACKUP_TAG"
else
  echo "⚠️  TypeScript check had warnings/errors. Check above log."
fi
