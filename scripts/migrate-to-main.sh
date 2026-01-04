#!/usr/bin/env bash
# Script to migrate from master to main branch
# Usage: ./scripts/migrate-to-main.sh

set -e

echo "🔄 Default Branch Migration: master → main"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if we're on master branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ensure we have the latest master
echo ""
echo "📥 Fetching latest changes..."
git fetch origin

# Check if main already exists
if git show-ref --verify --quiet refs/heads/main; then
    echo "⚠️  Warning: Local main branch already exists"
    read -p "Do you want to delete it and recreate? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D main
    else
        echo "❌ Aborted"
        exit 1
    fi
fi

if git ls-remote --heads origin main | grep -q main; then
    echo "⚠️  Warning: Remote main branch already exists"
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

# Checkout master and ensure it's up to date
echo ""
echo "🔄 Checking out master branch..."
if ! git rev-parse --verify master > /dev/null 2>&1; then
    echo "❌ Error: master branch does not exist locally"
    echo "Attempting to checkout from origin..."
    if ! git checkout -b master origin/master; then
        echo "❌ Error: Could not checkout master from origin"
        exit 1
    fi
else
    git checkout master
    git pull origin master
fi

# Create main branch
echo ""
echo "🌿 Creating main branch..."
git checkout -b main

# Push to origin
echo ""
echo "📤 Pushing main branch to origin..."
git push -u origin main

echo ""
echo "✅ Success! The main branch has been created and pushed."
echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/settings/branches"
echo "2. Change the default branch from 'master' to 'main'"
echo "3. Update branch protection rules"
echo "4. Notify contributors about the change"
echo "5. See BRANCH_MIGRATION.md for detailed instructions"
echo ""
echo "⚠️  Note: Do not delete the master branch until you've verified everything works on main"
