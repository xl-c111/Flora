#!/bin/bash
set -e

# Log all output for debugging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=== Flora Backend Deployment Started at $(date) ==="

# Update system
apt-get update
apt-get install -y git curl jq

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install pnpm globally using npm (simpler and works for all users)
npm install -g pnpm

# Install PM2 globally
npm install -g pm2

# Get GitHub token from SSM (for private repos) - optional if repo is public
# GITHUB_TOKEN=$(aws ssm get-parameter \
#   --name "/flora/prod/github_token" \
#   --with-decryption \
#   --region ap-southeast-2 \
#   --query 'Parameter.Value' \
#   --output text)

# Clone repository (use HTTPS with token for private repos)
cd /home/ubuntu
git clone https://github.com/xl-c111/Flora.git
# For private repos: git clone https://$GITHUB_TOKEN@github.com/xl-c111/Flora.git

cd Flora
chown -R ubuntu:ubuntu /home/ubuntu/Flora

# Install dependencies
sudo -u ubuntu pnpm install

# Build backend
sudo -u ubuntu pnpm --filter backend build

# Generate .env from SSM Parameter Store
echo "=== Generating .env from SSM Parameter Store ==="
cat > /home/ubuntu/Flora/apps/backend/.env <<EOF
# Database
DATABASE_URL=postgresql://$(aws ssm get-parameter --name "/flora/prod/db_username" --query 'Parameter.Value' --output text --region ap-southeast-2):$(aws ssm get-parameter --name "/flora/prod/db_password" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)@${RDS_ENDPOINT}:5432/flora_db

# Auth0
AUTH0_DOMAIN=$(aws ssm get-parameter --name "/flora/prod/auth0_domain" --query 'Parameter.Value' --output text --region ap-southeast-2)
AUTH0_CLIENT_ID=$(aws ssm get-parameter --name "/flora/prod/auth0_client_id" --query 'Parameter.Value' --output text --region ap-southeast-2)
AUTH0_CLIENT_SECRET=$(aws ssm get-parameter --name "/flora/prod/auth0_client_secret" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)
AUTH0_AUDIENCE=$(aws ssm get-parameter --name "/flora/prod/auth0_audience" --query 'Parameter.Value' --output text --region ap-southeast-2)

# Stripe
STRIPE_SECRET_KEY=$(aws ssm get-parameter --name "/flora/prod/stripe_secret_key" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)
STRIPE_PUBLISHABLE_KEY=$(aws ssm get-parameter --name "/flora/prod/stripe_publishable_key" --query 'Parameter.Value' --output text --region ap-southeast-2)
STRIPE_WEBHOOK_SECRET=$(aws ssm get-parameter --name "/flora/prod/stripe_webhook_secret" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)
STRIPE_WEEKLY_PRICE_ID=$(aws ssm get-parameter --name "/flora/prod/stripe_weekly_price_id" --query 'Parameter.Value' --output text --region ap-southeast-2)
STRIPE_BIWEEKLY_PRICE_ID=$(aws ssm get-parameter --name "/flora/prod/stripe_biweekly_price_id" --query 'Parameter.Value' --output text --region ap-southeast-2)
STRIPE_MONTHLY_PRICE_ID=$(aws ssm get-parameter --name "/flora/prod/stripe_monthly_price_id" --query 'Parameter.Value' --output text --region ap-southeast-2)
STRIPE_SPONTANEOUS_PRICE_ID=$(aws ssm get-parameter --name "/flora/prod/stripe_spontaneous_price_id" --query 'Parameter.Value' --output text --region ap-southeast-2)

# Email
GMAIL_USER=$(aws ssm get-parameter --name "/flora/prod/gmail_user" --query 'Parameter.Value' --output text --region ap-southeast-2)
GMAIL_PASSWORD=$(aws ssm get-parameter --name "/flora/prod/gmail_password" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)

# AI & JWT
GEMINI_API_KEY=$(aws ssm get-parameter --name "/flora/prod/gemini_api_key" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)
JWT_SECRET=$(aws ssm get-parameter --name "/flora/prod/jwt_secret" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)

# Environment
NODE_ENV=production
PORT=3001
EOF

chown ubuntu:ubuntu /home/ubuntu/Flora/apps/backend/.env

# Run database migrations and seed
cd /home/ubuntu/Flora/apps/backend
sudo -u ubuntu pnpm db:setup

# Start application with PM2
cd /home/ubuntu/Flora/apps/backend
sudo -u ubuntu pm2 start dist/index.js --name flora-backend
sudo -u ubuntu pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo -u ubuntu pm2 save

# Configure CloudWatch Logs agent (optional but recommended)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb

# Create CloudWatch config
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<EOF
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ubuntu/.pm2/logs/flora-backend-out.log",
            "log_group_name": "/aws/ec2/flora-backend",
            "log_stream_name": "{instance_id}/application"
          },
          {
            "file_path": "/var/log/user-data.log",
            "log_group_name": "/aws/ec2/flora-backend",
            "log_stream_name": "{instance_id}/user-data"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

echo "=== Flora Backend Deployment Completed at $(date) ==="
echo "=== Check application status: pm2 status ==="
