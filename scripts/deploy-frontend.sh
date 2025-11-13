#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy-frontend.sh [cloudfront-invalidate]
# If you pass any argument, the script also invalidates CloudFront (defaults to index.html only).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🌼 Building frontend bundle..."
pnpm --filter frontend build

BUCKET=$(cd terraform && terraform output -raw frontend_bucket_name)
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
  DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
  echo "🚀 Invalidating CloudFront distribution $DIST_ID (index.html)"
  aws cloudfront create-invalidation \
    --distribution-id "$DIST_ID" \
    --paths "/index.html"
else
  echo "ℹ️ Skipping CloudFront invalidation (pass any arg to enable)."
fi

echo "✅ Frontend deploy complete."
