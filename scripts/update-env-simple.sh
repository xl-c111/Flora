#!/usr/bin/env bash
set -euo pipefail

# Super Simple Environment Update Script (No SSH Required)
# Usage: ./scripts/update-env-simple.sh <param-name> <param-value>

PARAM_NAME=${1:-}
PARAM_VALUE=${2:-}
AWS_REGION="ap-southeast-2"

if [[ -z "$PARAM_NAME" || -z "$PARAM_VALUE" ]]; then
  echo "Usage: $0 <param-name> <param-value>"
  echo ""
  echo "Examples:"
  echo "  $0 gemini_api_key 'your-key'"
  echo "  $0 auth0_domain 'tenant.auth0.com'"
  exit 1
fi

echo "🔐 Updating SSM Parameter: /flora/prod/${PARAM_NAME}"
aws ssm put-parameter \
  --name "/flora/prod/${PARAM_NAME}" \
  --value "$PARAM_VALUE" \
  --type "SecureString" \
  --overwrite \
  --region "$AWS_REGION"

echo "✅ SSM parameter updated!"
echo ""
echo "🚀 Triggering deployment via GitHub..."

# Use a fixed branch name for all env updates
BRANCH="update-env-vars"

# Switch to main first
git checkout main 2>/dev/null || true

# Delete old branch if it exists (locally and remotely)
git branch -D "$BRANCH" 2>/dev/null || true
git push origin --delete "$BRANCH" 2>/dev/null || true

# Create fresh branch
git checkout -b "$BRANCH"

# Commit and push
git commit --allow-empty -m "Deploy: Updated ${PARAM_NAME}"
git push origin "$BRANCH"

# Create and merge PR
gh pr create \
  --title "Deploy: Update ${PARAM_NAME}" \
  --body "Updated ${PARAM_NAME} in SSM Parameter Store" \
  --base main \
  --head "$BRANCH"

echo ""
echo "✅ Pull request created!"
echo ""
read -p "Auto-merge PR now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  gh pr merge --merge --delete-branch
  echo "✅ Deployment triggered! Check GitHub Actions for progress."
  gh run watch || echo "Run 'gh run watch' to monitor deployment"
else
  echo "Merge manually when ready:"
  gh pr view --web
fi
