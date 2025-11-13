#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/deploy-backend.sh [environment] [aws-region] [rds-endpoint]
# Example:
#   ./scripts/deploy-backend.sh prod ap-southeast-2 flora-db-production.cbm26q24g3sj.ap-southeast-2.rds.amazonaws.com
#
# This script regenerates the backend .env with fresh SSM secrets, rebuilds
# the Prisma client + backend bundle, and restarts the PM2 process.

ENVIRONMENT=${1:-prod}
AWS_REGION=${2:-ap-southeast-2}
RDS_ENDPOINT=${3:-}

if [[ -z "${RDS_ENDPOINT}" ]]; then
  echo "error: missing RDS endpoint hostname (third argument)" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔐 Regenerating backend .env from SSM (${ENVIRONMENT}, ${AWS_REGION})..."
"${ROOT_DIR}/scripts/generate-backend-env.sh" "${ENVIRONMENT}" "${AWS_REGION}" "${RDS_ENDPOINT}"

echo "🧱 Regenerating Prisma client..."
cd "${ROOT_DIR}"
pnpm --filter backend db:generate

echo "🏗️  Building backend..."
pnpm --filter backend build

echo "🚀 Restarting PM2 process..."
cd "${ROOT_DIR}/apps/backend"
pm2 restart flora-backend --update-env
pm2 save

echo "✅ Backend deployment complete."
