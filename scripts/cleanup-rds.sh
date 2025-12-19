#!/usr/bin/env bash
set -euo pipefail

# Cleanup RDS Resources
# Run this AFTER verifying EC2 PostgreSQL works correctly
# This will delete your RDS instance and save ~$20/month

AWS_REGION=${1:-ap-southeast-2}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Cleanup RDS Resources (Cost Savings)                 ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}⚠  WARNING: This will delete your RDS database!${NC}"
echo -e "${YELLOW}   Make sure your EC2 PostgreSQL is working correctly!${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo -e "${YELLOW}[1/3]${NC} Finding RDS instance..."
RDS_ID=$(aws rds describe-db-instances \
  --region "${AWS_REGION}" \
  --query 'DBInstances[?contains(DBInstanceIdentifier, `flora`)].DBInstanceIdentifier' \
  --output text | head -1)

if [[ -z "$RDS_ID" ]]; then
  echo -e "${GREEN}✓${NC} No RDS instance found (already deleted)"
  exit 0
fi

echo -e "${YELLOW}Found RDS instance: ${RDS_ID}${NC}"
echo ""

echo -e "${YELLOW}[2/3]${NC} Creating final snapshot before deletion..."
SNAPSHOT_ID="${RDS_ID}-final-snapshot-$(date +%Y%m%d-%H%M%S)"
aws rds create-db-snapshot \
  --db-instance-identifier "${RDS_ID}" \
  --db-snapshot-identifier "${SNAPSHOT_ID}" \
  --region "${AWS_REGION}"

echo -e "${GREEN}✓${NC} Snapshot created: ${SNAPSHOT_ID}"
echo ""

echo -e "${YELLOW}[3/3]${NC} Deleting RDS instance..."
aws rds delete-db-instance \
  --db-instance-identifier "${RDS_ID}" \
  --skip-final-snapshot \
  --region "${AWS_REGION}"

echo -e "${GREEN}✓${NC} RDS deletion initiated"
echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo "Cost savings: ~$20-25/month"
echo "Final snapshot kept: ${SNAPSHOT_ID}"
echo ""
echo "Note: RDS deletion takes 5-10 minutes to complete."
echo "You can check status with:"
echo "  aws rds describe-db-instances --region ${AWS_REGION}"
