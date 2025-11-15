#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy-frontend.sh [cloudfront-invalidate]
# If you pass any argument, the script also invalidates CloudFront (defaults to index.html only).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🌼 Building frontend bundle..."
pnpm --filter frontend build

# Get S3 bucket name
if [[ -n "${FRONTEND_BUCKET:-}" ]]; then
  BUCKET="${FRONTEND_BUCKET}"
else
  # Try terraform first
  if command -v terraform &> /dev/null && [[ -d terraform ]]; then
    BUCKET=$(cd terraform && terraform output -raw frontend_bucket_name 2>/dev/null || echo "")
  fi

  # If terraform didn't work, auto-detect from AWS
  if [[ -z "$BUCKET" ]]; then
    echo "🔍 Auto-detecting S3 bucket..."
    BUCKET=$(aws s3api list-buckets --query 'Buckets[?contains(Name, `flora`) && contains(Name, `frontend`)].Name' --output text 2>/dev/null | head -1)

    if [[ -z "$BUCKET" ]]; then
      echo "❌ Could not find S3 bucket. Please set FRONTEND_BUCKET environment variable."
      exit 1
    fi
    echo "✅ Found bucket: $BUCKET"
  fi
fi
DIST_DIR="apps/frontend/dist"

echo "☁️ Syncing hashed assets to S3 bucket: $BUCKET"
aws s3 sync "$DIST_DIR" "s3://$BUCKET/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

echo "📄 Uploading index.html with short cache"
aws s3 cp "$DIST_DIR/index.html" "s3://$BUCKET/index.html" \
  --cache-control "public,max-age=60"

if [[ $# -gt 0 ]]; then
  # Get CloudFront distribution ID
  if [[ -n "${CLOUDFRONT_DIST_ID:-}" ]]; then
    DIST_ID="${CLOUDFRONT_DIST_ID}"
  else
    # Try terraform first
    if command -v terraform &> /dev/null && [[ -d terraform ]]; then
      DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
    fi

    # If terraform didn't work, auto-detect from AWS
    if [[ -z "$DIST_ID" ]]; then
      echo "🔍 Auto-detecting CloudFront distribution..."
      DIST_ID=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?contains(Comment, 'flora') || contains(Comment, 'Flora')].Id" \
        --output text 2>/dev/null | head -1)

      if [[ -z "$DIST_ID" ]]; then
        echo "⚠️  Could not find CloudFront distribution. Skipping invalidation."
        echo "   Set CLOUDFRONT_DIST_ID environment variable to enable."
      else
        echo "✅ Found distribution: $DIST_ID"
      fi
    fi
  fi

  if [[ -n "$DIST_ID" ]]; then
    echo "🚀 Invalidating CloudFront distribution $DIST_ID (index.html)"
    aws cloudfront create-invalidation \
      --distribution-id "$DIST_ID" \
      --paths "/index.html"
  fi
else
  echo "ℹ️ Skipping CloudFront invalidation (pass any arg to enable)."
fi

echo "✅ Frontend deploy complete."
