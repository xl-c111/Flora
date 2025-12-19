#!/usr/bin/env bash
set -euo pipefail

# Flora RDS to EC2 Migration - Remote Version
# This script runs everything on EC2 (no local PostgreSQL needed)
#
# Usage: ./scripts/migrate-rds-to-ec2-remote.sh

ENVIRONMENT=${1:-prod}
AWS_REGION=${2:-ap-southeast-2}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Flora RDS → EC2 PostgreSQL Migration (Remote)       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Get EC2 IP
echo -e "${YELLOW}[1/5]${NC} Finding EC2 instance..."
EC2_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=flora-backend-production" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region "$AWS_REGION" 2>/dev/null)

if [[ "$EC2_IP" == "None" || -z "$EC2_IP" ]]; then
  echo -e "${RED}✗ Error: Could not find running EC2 instance${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} EC2 Instance: $EC2_IP"

# Step 2: Find SSH key
echo -e "${YELLOW}[2/5]${NC} Finding SSH key..."
SSH_KEY=""
POSSIBLE_KEYS=(
  "$HOME/.ssh/flora-backend.pem"
  "$HOME/.ssh/flora.pem"
  "$HOME/.ssh/flora-key.pem"
)

for key in "${POSSIBLE_KEYS[@]}"; do
  if [[ -f "$key" ]]; then
    SSH_KEY="$key"
    echo -e "${GREEN}✓${NC} Found: $(basename $SSH_KEY)"
    break
  fi
done

if [[ -z "$SSH_KEY" ]]; then
  echo -e "${RED}✗ Error: SSH key not found${NC}"
  exit 1
fi

# Step 3: Get RDS endpoint
echo -e "${YELLOW}[3/5]${NC} Getting RDS endpoint..."
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --region "${AWS_REGION}" \
  --query 'DBInstances[?contains(DBInstanceIdentifier, `flora`)].Endpoint.Address' \
  --output text 2>/dev/null | head -1)

if [[ -z "${RDS_ENDPOINT}" ]]; then
  echo -e "${RED}✗ Error: Could not find RDS instance${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} RDS: ${RDS_ENDPOINT}"
echo ""

# Step 4: Confirmation
echo -e "${YELLOW}⚠  This will:${NC}"
echo "  1. Backup RDS database"
echo "  2. Stop backend (5-10 min downtime)"
echo "  3. Start PostgreSQL on EC2"
echo "  4. Restore database"
echo "  5. Restart backend"
echo ""
read -p "Continue? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Migration cancelled."
  exit 0
fi
echo ""

# Step 5: Run migration on EC2
echo -e "${YELLOW}[4/5]${NC} Executing migration on EC2..."
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@"$EC2_IP" bash <<EOSSH
set -e

echo "🚀 Starting migration on EC2..."
echo ""

# Get database credentials from SSM
echo "📋 Getting database credentials from SSM..."
DB_USER=\$(aws ssm get-parameter \
  --name "/flora/${ENVIRONMENT}/db_username" \
  --query 'Parameter.Value' \
  --output text \
  --region "${AWS_REGION}")

DB_PASSWORD=\$(aws ssm get-parameter \
  --name "/flora/${ENVIRONMENT}/db_password" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region "${AWS_REGION}")

echo "✓ Credentials retrieved"
echo ""

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "📦 Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker ubuntu
  rm get-docker.sh
  echo "✓ Docker installed"
else
  echo "✓ Docker already installed"
fi
echo ""

# Install PostgreSQL 15 client (match RDS version)
echo "📦 Installing PostgreSQL 15 client..."
sudo apt-get update -qq
sudo apt-get install -y -qq postgresql-client-15 || {
  # If postgresql-client-15 not available, add official PostgreSQL repo
  sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt \$(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
  sudo apt-get update -qq
  sudo apt-get install -y -qq postgresql-client-15
}
echo "✓ PostgreSQL 15 client installed"
echo ""

# Create backup directory
mkdir -p /home/ubuntu/Flora/backups
cd /home/ubuntu/Flora

# Backup RDS database
echo "💾 Creating RDS backup..."
BACKUP_FILE="backups/flora_rds_backup_\$(date +%Y%m%d_%H%M%S).sql"
PGPASSWORD="\${DB_PASSWORD}" pg_dump \
  -h "${RDS_ENDPOINT}" \
  -U "\${DB_USER}" \
  -d flora_db \
  -F c \
  -f "\${BACKUP_FILE}"

echo "✓ Backup created: \${BACKUP_FILE} (\$(du -h \${BACKUP_FILE} | cut -f1))"
echo ""

# Stop backend
echo "🛑 Stopping backend..."
pm2 stop flora-backend || true
echo "✓ Backend stopped"
echo ""

# Start PostgreSQL container
echo "🐳 Starting PostgreSQL container..."
export DB_USER="\${DB_USER}"
export DB_PASSWORD="\${DB_PASSWORD}"

# Use docker compose (v2) instead of docker-compose (v1)
docker compose -f docker-compose.ec2.yml down 2>/dev/null || true
docker compose -f docker-compose.ec2.yml up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker exec flora-postgres pg_isready -U "\${DB_USER}" -d flora_db 2>/dev/null; then
    echo "✓ PostgreSQL is ready"
    break
  fi
  sleep 2
done
echo ""

# Restore database
echo "📥 Restoring database to EC2 PostgreSQL..."
docker exec -i flora-postgres pg_restore \
  -U "\${DB_USER}" \
  -d flora_db \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  < "\${BACKUP_FILE}" 2>&1 | grep -v "already exists\|does not exist" || true

echo "✓ Database restored"
echo ""

# Update backend .env
echo "🔧 Updating backend configuration..."
cd /home/ubuntu/Flora

# Get all other secrets from SSM
AUTH0_DOMAIN=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/auth0_domain" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
AUTH0_CLIENT_ID=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/auth0_client_id" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
AUTH0_CLIENT_SECRET=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/auth0_client_secret" --with-decryption --query 'Parameter.Value' --output text --region "${AWS_REGION}")
AUTH0_AUDIENCE=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/auth0_audience" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
STRIPE_SECRET_KEY=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/stripe_secret_key" --with-decryption --query 'Parameter.Value' --output text --region "${AWS_REGION}")
STRIPE_PUBLISHABLE_KEY=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/stripe_publishable_key" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
STRIPE_WEBHOOK_SECRET=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/stripe_webhook_secret" --with-decryption --query 'Parameter.Value' --output text --region "${AWS_REGION}")
STRIPE_WEEKLY_PRICE_ID=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/stripe_weekly_price_id" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
STRIPE_BIWEEKLY_PRICE_ID=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/stripe_biweekly_price_id" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
STRIPE_MONTHLY_PRICE_ID=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/stripe_monthly_price_id" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
STRIPE_SPONTANEOUS_PRICE_ID=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/stripe_spontaneous_price_id" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
GMAIL_USER=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/gmail_user" --query 'Parameter.Value' --output text --region "${AWS_REGION}")
GMAIL_PASSWORD=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/gmail_password" --with-decryption --query 'Parameter.Value' --output text --region "${AWS_REGION}")
GEMINI_API_KEY=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/gemini_api_key" --with-decryption --query 'Parameter.Value' --output text --region "${AWS_REGION}")
JWT_SECRET=\$(aws ssm get-parameter --name "/flora/${ENVIRONMENT}/jwt_secret" --with-decryption --query 'Parameter.Value' --output text --region "${AWS_REGION}")

# Generate new .env with LOCAL PostgreSQL
cat > apps/backend/.env <<ENVFILE
# Generated by migration script on \$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NODE_ENV=production
PORT=3001

# LOCAL PostgreSQL on EC2 (migrated from RDS)
DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@localhost:5432/flora_db

AUTH0_DOMAIN=\${AUTH0_DOMAIN}
AUTH0_CLIENT_ID=\${AUTH0_CLIENT_ID}
AUTH0_CLIENT_SECRET=\${AUTH0_CLIENT_SECRET}
AUTH0_AUDIENCE=\${AUTH0_AUDIENCE}

STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY}
STRIPE_PUBLISHABLE_KEY=\${STRIPE_PUBLISHABLE_KEY}
STRIPE_WEBHOOK_SECRET=\${STRIPE_WEBHOOK_SECRET}
STRIPE_WEEKLY_PRICE_ID=\${STRIPE_WEEKLY_PRICE_ID}
STRIPE_BIWEEKLY_PRICE_ID=\${STRIPE_BIWEEKLY_PRICE_ID}
STRIPE_MONTHLY_PRICE_ID=\${STRIPE_MONTHLY_PRICE_ID}
STRIPE_SPONTANEOUS_PRICE_ID=\${STRIPE_SPONTANEOUS_PRICE_ID}

GMAIL_USER=\${GMAIL_USER}
GMAIL_PASSWORD=\${GMAIL_PASSWORD}
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=\${GMAIL_USER}
SMTP_PASS=\${GMAIL_PASSWORD}
FROM_EMAIL=\${GMAIL_USER}
FROM_NAME=Flora Marketplace
CONTACT_EMAIL=\${GMAIL_USER}

GEMINI_API_KEY=\${GEMINI_API_KEY}
JWT_SECRET=\${JWT_SECRET}

FRONTEND_URL=https://dzmu16crq41il.cloudfront.net
BACKEND_PUBLIC_URL=https://dzmu16crq41il.cloudfront.net
EMAIL_IMAGE_BASE_URL=https://dzmu16crq41il.cloudfront.net
EMAIL_LOGO_URL=https://dzmu16crq41il.cloudfront.net/flora-logo.png
EMAIL_INLINE_ITEM_IMAGES=false
ENVFILE

echo "✓ Backend configuration updated"
echo ""

# Regenerate Prisma client
echo "🧱 Regenerating Prisma client..."
pnpm --filter backend db:generate
echo ""

# Rebuild backend
echo "🏗️  Building backend..."
pnpm --filter backend build
echo ""

# Start backend
echo "🚀 Starting backend..."
cd apps/backend
pm2 restart flora-backend --update-env
pm2 save

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent logs:"
pm2 logs flora-backend --lines 20 --nostream

echo ""
echo "✅ Migration complete on EC2!"
EOSSH

# Step 6: Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}[5/5]${NC} Migration Summary"
echo ""
echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo ""
echo "Database: PostgreSQL now running on EC2"
echo "Backend: Updated and restarted"
echo "Backup: Saved on EC2 in ~/Flora/backups/"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "1. Test your application: https://dzmu16crq41il.cloudfront.net"
echo "2. Verify all features work correctly"
echo "3. After 24-48 hours, cleanup RDS: ./scripts/cleanup-rds.sh"
echo ""
echo -e "${GREEN}💰 You'll save \$20-25/month after RDS cleanup!${NC}"
echo ""
