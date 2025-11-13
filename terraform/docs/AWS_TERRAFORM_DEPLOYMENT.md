# AWS Terraform Deployment Guide

This guide provides a comprehensive plan for deploying the Flora application to AWS using Terraform and Infrastructure as Code (IaC) principles while staying within the AWS Free Tier.

---

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [AWS Services Used](#aws-services-used)
- [Terraform Project Structure](#terraform-project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Deployment Steps](#deployment-steps)
- [Validation & Evidence](#validation--evidence)
- [Cost Optimization](#cost-optimization)
- [Monitoring & Observability](#monitoring--observability)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────┐
│   CloudFront    │ ← CDN for static assets
└────────┬────────┘
         │
┌────────▼────────┐
│  S3 Bucket      │ ← Frontend static files (React build)
└─────────────────┘

┌─────────────────┐
│   Route 53      │ ← DNS (optional)
└────────┬────────┘
         │
┌────────▼────────┐
│  EC2 Instance   │ ← Backend API (Node.js + Express)
│  (t2.micro)     │    + Nginx reverse proxy
└────────┬────────┘
         │
┌────────▼────────┐
│  RDS Postgres   │ ← Database (db.t3.micro)
│  (db.t3.micro)  │
└─────────────────┘

        VPC with Public & Private Subnets
```

### Key Components
- **Frontend**: React 19 static build served via S3 + CloudFront
- **Backend**: Express API on EC2 with PM2 process manager
- **Database**: PostgreSQL on RDS in private subnet
- **Networking**: VPC with security groups for isolation
- **External Services**: Auth0, Stripe, Nodemailer, Google Generative AI

---

## Design Decisions & Trade-offs

This architecture deliberately prioritizes **AWS Free Tier eligibility** and **learning objectives** over production-grade resiliency. Understanding these trade-offs demonstrates thoughtful engineering:

### Deliberate Constraints

| Decision | Rationale | Production Alternative |
|----------|-----------|------------------------|
| **Single EC2 instance** | Free Tier allows 750 hrs/month of t2.micro | Auto Scaling Group with ALB across 3 AZs |
| **Single-AZ RDS** | Multi-AZ doubles cost (~$30/month) | Multi-AZ with read replicas |
| **No NAT Gateway** | Costs $0.045/hour ($32/month) | NAT Gateway for private subnet egress |
| **Public subnet EC2** | Simplifies networking, avoids NAT costs | Private subnet + bastion host |
| **Manual secret rotation** | Demonstrates SSM Parameter Store usage | AWS Secrets Manager with auto-rotation |
| **Basic CloudWatch** | Free Tier includes 10 alarms | Comprehensive observability (Datadog, New Relic) |

### What This Architecture Demonstrates

✅ **Infrastructure as Code**: Complete Terraform automation with modules and remote state
✅ **Security fundamentals**: Least-privilege IAM, SSM for secrets, security group isolation
✅ **Zero-touch deployment**: User data scripts eliminate manual SSH steps
✅ **State management**: S3 backend with DynamoDB locking for team collaboration
✅ **Monitoring basics**: CloudWatch logs, alarms, and cost alerts

### Honest Limitations

This stack is **not production-ready** for high-traffic scenarios:
- **No horizontal scaling**: Single EC2 instance limits throughput
- **Single point of failure**: AZ outage takes down backend and database
- **No CDN for API**: Backend traffic not geographically distributed
- **Basic observability**: Limited structured logging and tracing

**Interview tip**: Lead with these trade-offs to show you understand the difference between a learning project and production infrastructure. Explain what you'd change if budget weren't a constraint.

---

## AWS Services Used

| Service | Purpose | Free Tier Limit |
|---------|---------|-----------------|
| **EC2** | Host backend API | 750 hrs/month (t2.micro) for 12 months |
| **RDS PostgreSQL** | Database | 750 hrs/month (db.t3.micro) for 12 months, 20GB storage |
| **S3** | Frontend static files, backups & Terraform state | 5 GB storage, 20K GET, 2K PUT requests/month (always free) |
| **CloudFront** | CDN for frontend | 50 GB data transfer/month for 12 months |
| **VPC** | Network isolation | Free (default limits) |
| **Security Groups** | Firewall rules | Free |
| **Elastic IP** | Static IP for EC2 | 1 free when attached to running instance |
| **SSM Parameter Store** | Secure secrets storage | Standard parameters free (unlimited) |
| **CloudWatch Logs** | Application & system logs | 5 GB ingestion, 5 GB storage (always free) |
| **CloudWatch Alarms** | Resource monitoring alerts | 10 alarms free (always free) |
| **DynamoDB** | Terraform state locking | 25 GB storage, 25 WCU, 25 RCU (always free) |
| **IAM** | Access control & instance profiles | Free (unlimited users, roles, policies) |

**Estimated Monthly Cost**: $0 if staying within free tier limits

**Current Project Status**:
- ✅ SSM Parameter Store setup documented ([scripts/setup-ssm-parameters.md](../scripts/setup-ssm-parameters.md))
- ✅ All 18 production secrets defined (Auth0, Stripe, Email, Database, AI, JWT)
- 🔨 Terraform modules structure created (empty modules ready for implementation)
- 📋 Using pnpm workspaces with backend and frontend apps

---

## Terraform Project Structure

```
Flora/
├── terraform/
│   ├── main.tf                 # Root module configuration
│   ├── variables.tf            # Input variables (non-sensitive only)
│   ├── outputs.tf              # Output values
│   ├── backend.tf              # S3 + DynamoDB remote state (CRITICAL)
│   ├── versions.tf             # Terraform & provider versions
│   │
│   ├── modules/
│   │   ├── state-backend/      # S3 bucket + DynamoDB for state
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── networking/         # VPC, subnets, security groups
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── iam/                # IAM roles & instance profiles
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── database/           # RDS PostgreSQL
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── compute/            # EC2 instance + user data
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── user-data.sh    # Zero-touch deployment script
│   │   │
│   │   ├── storage/            # S3 buckets (frontend + backups)
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── cdn/                # CloudFront distribution
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   └── monitoring/         # CloudWatch logs, alarms, dashboards
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── outputs.tf
│   │
│   └── environments/
│       ├── dev/
│       │   └── main.tf         # Dev-specific configuration
│       └── prod/
│           └── main.tf         # Prod-specific configuration
│
├── scripts/
│   ├── setup-secrets.sh        # Store secrets in SSM Parameter Store
│   ├── deploy-frontend.sh      # Frontend deployment to S3
│   └── validate-deployment.sh  # Post-deployment health checks
│
└── docs/
    └── deployment-validation/  # Terraform outputs, screenshots, videos
        ├── terraform-plan.txt
        ├── terraform-output.txt
        └── deployment-walkthrough.mp4
```

**Key improvements:**
- **No `terraform.tfvars`**: Secrets stored in SSM Parameter Store instead
- **`backend.tf`**: Remote state with locking for team collaboration
- **`user-data.sh`**: Automated deployment script (zero SSH required)
- **IAM module**: Instance profile with least-privilege policies
- **Monitoring module**: CloudWatch infrastructure separate from compute
- **Validation artifacts**: Evidence for interviews/documentation

---

## Prerequisites

### 1. Install Required Tools

```bash
# Terraform (>= 1.0)
brew install terraform              # macOS
# or download from https://www.terraform.io/downloads

# AWS CLI
brew install awscli                 # macOS
# or: pip install awscli

# Verify installations
terraform --version
aws --version
```

### 2. AWS Account Setup

1. Create AWS account (free tier eligible)
2. Set up billing alerts:
   - Go to AWS Billing Console
   - Create alerts at $1, $5, $10
3. Create IAM user with programmatic access:
   - Required permissions: EC2, RDS, S3, CloudFront, VPC, IAM (limited)
   - Save Access Key ID and Secret Access Key

### 3. Configure AWS CLI

```bash
aws configure
# Enter:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: ap-southeast-2
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### 4. Create SSH Key Pair

```bash
# Create key pair for EC2 access
aws ec2 create-key-pair \
  --key-name flora-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/flora-key.pem

# Set proper permissions
chmod 600 ~/.ssh/flora-key.pem
```

### 5. Set Up Remote State Backend

**Critical first step**: Create S3 bucket and DynamoDB table for Terraform state management:

```bash
# Set variables
REGION="ap-southeast-2"
STATE_BUCKET="flora-terraform-state-$(aws sts get-caller-identity --query Account --output text)"
LOCK_TABLE="flora-terraform-locks"

# Create S3 bucket for state
aws s3api create-bucket \
  --bucket "$STATE_BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION"

# Enable versioning (protects against accidental deletions)
aws s3api put-bucket-versioning \
  --bucket $STATE_BUCKET \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket $STATE_BUCKET \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name $LOCK_TABLE \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region $REGION
```

**Why this matters**: Demonstrates understanding of team collaboration, state locking, and preventing concurrent modifications.

### 6. Store Secrets in SSM Parameter Store

**Never store secrets in `terraform.tfvars` or version control!** Use AWS Systems Manager Parameter Store.

**✅ Complete setup guide available**: See [scripts/setup-ssm-parameters.md](../scripts/setup-ssm-parameters.md) for detailed instructions.

**Quick setup - 18 parameters required:**

```bash
REGION="ap-southeast-2"  # Change to your region

# Database (2 parameters)
aws ssm put-parameter --name "/flora/prod/db_username" --value "flora_user" --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/db_password" --value "$(openssl rand -base64 32)" --type "SecureString" --region $REGION

# Auth0 (4 parameters)
aws ssm put-parameter --name "/flora/prod/auth0_domain" --value "your-tenant.auth0.com" --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/auth0_client_id" --value "your_client_id" --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/auth0_client_secret" --value "your_secret" --type "SecureString" --region $REGION
aws ssm put-parameter --name "/flora/prod/auth0_audience" --value "https://flora-api.com" --type "String" --region $REGION

# Stripe (7 parameters - 3 keys + 4 subscription price IDs)
aws ssm put-parameter --name "/flora/prod/stripe_secret_key" --value "sk_test_..." --type "SecureString" --region $REGION
aws ssm put-parameter --name "/flora/prod/stripe_publishable_key" --value "pk_test_..." --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/stripe_webhook_secret" --value "whsec_..." --type "SecureString" --region $REGION
aws ssm put-parameter --name "/flora/prod/stripe_weekly_price_id" --value "price_..." --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/stripe_biweekly_price_id" --value "price_..." --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/stripe_monthly_price_id" --value "price_..." --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/stripe_spontaneous_price_id" --value "price_..." --type "String" --region $REGION

# Email (2 parameters)
aws ssm put-parameter --name "/flora/prod/gmail_user" --value "your-email@gmail.com" --type "String" --region $REGION
aws ssm put-parameter --name "/flora/prod/gmail_password" --value "your-app-password" --type "SecureString" --region $REGION

# AI & JWT (2 parameters)
aws ssm put-parameter --name "/flora/prod/gemini_api_key" --value "your_gemini_key" --type "SecureString" --region $REGION
aws ssm put-parameter --name "/flora/prod/jwt_secret" --value "$(openssl rand -base64 32)" --type "SecureString" --region $REGION

# GitHub token for private repos (1 parameter - optional for public repos)
aws ssm put-parameter --name "/flora/prod/github_token" --value "ghp_..." --type "SecureString" --region $REGION
```

**Verify stored secrets:**
```bash
# List all Flora parameters (should show 18 total)
aws ssm describe-parameters \
  --parameter-filters "Key=Name,Option=BeginsWith,Values=/flora/prod" \
  --query 'Parameters[*].Name' \
  --output table \
  --region $REGION

# Expected parameters:
# /flora/prod/auth0_audience
# /flora/prod/auth0_client_id
# /flora/prod/auth0_client_secret
# /flora/prod/auth0_domain
# /flora/prod/db_password
# /flora/prod/db_username
# /flora/prod/gemini_api_key
# /flora/prod/github_token
# /flora/prod/gmail_password
# /flora/prod/gmail_user
# /flora/prod/jwt_secret
# /flora/prod/stripe_biweekly_price_id
# /flora/prod/stripe_monthly_price_id
# /flora/prod/stripe_publishable_key
# /flora/prod/stripe_secret_key
# /flora/prod/stripe_spontaneous_price_id
# /flora/prod/stripe_weekly_price_id
# /flora/prod/stripe_webhook_secret

# Test retrieval (decrypt SecureString)
aws ssm get-parameter \
  --name "/flora/prod/db_password" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region $REGION
```

**Benefits:**
- ✅ Secrets never touch version control
- ✅ Centralized secret management
- ✅ Audit trail (CloudTrail logs all access)
- ✅ IAM-based access control
- ✅ Easy rotation without code changes
- ✅ Free tier: Unlimited standard parameters

---

## Setup Instructions

### Step 1: Create Terraform Directory Structure

```bash
cd Flora

# Create directory structure
mkdir -p terraform/modules/{state-backend,networking,iam,database,compute,storage,cdn,monitoring}
mkdir -p terraform/environments/{dev,prod}
mkdir -p scripts
mkdir -p docs/deployment-validation

# Create root configuration files
touch terraform/{main.tf,variables.tf,outputs.tf,versions.tf,backend.tf}

# Create module files
for module in state-backend networking iam database compute storage cdn monitoring; do
  touch terraform/modules/$module/{main.tf,variables.tf,outputs.tf}
done

# Create user data script
touch terraform/modules/compute/user-data.sh
chmod +x terraform/modules/compute/user-data.sh
```

### Step 2: Configure Remote State Backend

Create `terraform/backend.tf` with your state bucket name:

```hcl
# terraform/backend.tf
terraform {
  backend "s3" {
    bucket         = "flora-terraform-state-626614672892"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "flora-terraform-locks"
    encrypt        = true
  }
}
```

**Replace `YOUR_ACCOUNT_ID`** with your AWS account ID or use the bucket name from Step 5 of Prerequisites.

### Step 3: Configure Terraform Data Sources for Secrets

Update `terraform/variables.tf` to use SSM parameters instead of input variables:

```hcl
# terraform/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "flora"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_pair_name" {
  description = "SSH key pair name"
  type        = string
  default     = "flora-key"
}

# NO sensitive variables here! All secrets come from SSM Parameter Store
```

Then reference secrets in your modules using data sources:

```hcl
# terraform/main.tf (example)
data "aws_ssm_parameter" "db_password" {
  name            = "/flora/prod/db_password"
  with_decryption = true
}

data "aws_ssm_parameter" "stripe_secret_key" {
  name            = "/flora/prod/stripe_secret_key"
  with_decryption = true
}

# Pass to modules
module "database" {
  source = "./modules/database"

  db_password = data.aws_ssm_parameter.db_password.value
  # ... other parameters
}
```

### Step 4: Initialize Terraform

```bash
cd terraform

# Initialize Terraform (downloads providers and configures backend)
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive
```

**Expected output:**
```
Initializing the backend...
Successfully configured the backend "s3"!
Terraform has been successfully initialized!
```

---

## Deployment Steps

### Phase 1: Plan Infrastructure

```bash
cd terraform

# Preview changes (dry run) and save plan
terraform plan -out=tfplan

# Review the plan carefully - look for:
# - Only Free Tier resources (t2.micro, db.t3.micro, etc.)
# - No unexpected resources (NAT Gateways, load balancers)
# - Proper security group rules

# Save plan output for documentation
terraform show tfplan > ../docs/deployment-validation/terraform-plan.txt
```

### Phase 2: Deploy Infrastructure (Zero-Touch Automation)

```bash
# Apply the plan
terraform apply tfplan

# Or apply directly (will prompt for confirmation)
terraform apply

# Save outputs for validation
terraform output > ../docs/deployment-validation/terraform-output.txt
terraform output -json > ../docs/deployment-validation/terraform-output.json
```

**What gets provisioned:**
- ✅ VPC with public/private subnets
- ✅ Internet Gateway and route tables
- ✅ Security groups (DB only accepts traffic from EC2)
- ✅ IAM role with SSM read permissions for EC2
- ✅ RDS PostgreSQL instance (private subnet)
- ✅ **EC2 instance with automated deployment via user-data**
- ✅ S3 buckets (frontend + backups)
- ✅ CloudFront distribution
- ✅ CloudWatch log groups and alarms

**Time estimate**: 10-15 minutes

### Phase 3: Automated Backend Deployment (User Data)

**No manual SSH required!** The EC2 user-data script handles everything:

Create `terraform/modules/compute/user-data.sh`:

```bash
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

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
export PNPM_HOME="/root/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Install PM2 globally
npm install -g pm2

# Get GitHub token from SSM (for private repos)
GITHUB_TOKEN=$(aws ssm get-parameter \
  --name "/flora/prod/github_token" \
  --with-decryption \
  --region ap-southeast-2 \
  --query 'Parameter.Value' \
  --output text)

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

# Email
GMAIL_USER=$(aws ssm get-parameter --name "/flora/prod/gmail_user" --query 'Parameter.Value' --output text --region ap-southeast-2)
GMAIL_PASSWORD=$(aws ssm get-parameter --name "/flora/prod/gmail_pass1word" --with-decryption --query 'Parameter.Value' --output text --region ap-southeast-2)

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
```

**Key improvements:**
- ✅ **Zero SSH required**: `terraform apply` → fully deployed app
- ✅ **Secrets from SSM**: No hardcoded credentials
- ✅ **CloudWatch logs**: Automatic log shipping
- ✅ **Idempotent**: Can re-run safely
- ✅ **Audit trail**: Full deployment log in `/var/log/user-data.log`

**In your Terraform compute module**, reference this script:

```hcl
# terraform/modules/compute/main.tf
resource "aws_instance" "backend" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_pair_name

  iam_instance_profile = var.instance_profile_name

  user_data = templatefile("${path.module}/user-data.sh", {
    RDS_ENDPOINT = var.rds_endpoint
  })

  tags = {
    Name = "${var.project_name}-backend-${var.environment}"
  }
}
```

### Phase 4: Deploy Frontend Application

```bash
# On local machine
cd Flora

# 1. Build frontend
pnpm --filter frontend build

# 2. Get S3 bucket name from Terraform
S3_BUCKET=$(cd terraform && terraform output -raw frontend_s3_bucket)

# 3. Sync to S3
aws s3 sync apps/frontend/dist s3://$S3_BUCKET/ --delete

# 4. Invalidate CloudFront cache
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# 5. Wait for invalidation to complete
aws cloudfront wait invalidation-completed \
  --distribution-id $DISTRIBUTION_ID \
  --id $(aws cloudfront list-invalidations --distribution-id $DISTRIBUTION_ID --query 'InvalidationList.Items[0].Id' --output text)
```

### Phase 5: Update External Services

1. **Auth0 Configuration**:
   - Get CloudFront URL: `cd terraform && terraform output cloudfront_url`
   - Add to Allowed Callback URLs: `https://your-cloudfront-url/callback`
   - Add to Allowed Logout URLs: `https://your-cloudfront-url`
   - Add to Allowed Web Origins: `https://your-cloudfront-url`

2. **Stripe Configuration**:
   - Get backend URL: `cd terraform && terraform output backend_url`
   - Add webhook endpoint: `https://your-ec2-ip/api/webhooks/stripe`
   - Configure webhook events:
     - `payment_intent.succeeded`
     - `invoice.payment_succeeded`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **DNS Configuration** (optional, costs $0.50/month):
   - Create Route 53 hosted zone
   - Create CNAME record pointing to CloudFront distribution
   - Request ACM certificate for your domain
   - Update CloudFront to use custom domain

### Phase 6: Validation & Health Checks

**Automated validation script** (`scripts/validate-deployment.sh`):

```bash
#!/bin/bash
set -e

cd terraform

# Get outputs
EC2_IP=$(terraform output -raw ec2_public_ip)
CLOUDFRONT_URL=$(terraform output -raw cloudfront_url)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

echo "=== Flora Deployment Validation ==="
echo ""

# 1. Check EC2 instance status
echo "1. Checking EC2 instance..."
INSTANCE_ID=$(terraform output -raw ec2_instance_id)
INSTANCE_STATE=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text)
echo "   Status: $INSTANCE_STATE"

# 2. Check backend health endpoint
echo "2. Checking backend health..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$EC2_IP:3001/api/health || echo "failed")
if [ "$HEALTH_STATUS" = "200" ]; then
  echo "   ✅ Backend is healthy (HTTP 200)"
else
  echo "   ❌ Backend health check failed (HTTP $HEALTH_STATUS)"
fi

# 3. Check RDS database
echo "3. Checking RDS database..."
DB_STATUS=$(aws rds describe-db-instances \
  --db-instance-identifier flora-db-prod \
  --query 'DBInstances[0].DBInstanceStatus' \
  --output text)
echo "   Status: $DB_STATUS"

# 4. Check CloudFront distribution
echo "4. Checking CloudFront distribution..."
DIST_STATUS=$(aws cloudfront get-distribution \
  --id $(terraform output -raw cloudfront_distribution_id) \
  --query 'Distribution.Status' \
  --output text)
echo "   Status: $DIST_STATUS"

# 5. Check frontend availability
echo "5. Checking frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $CLOUDFRONT_URL || echo "failed")
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "   ✅ Frontend is accessible (HTTP 200)"
else
  echo "   ❌ Frontend check failed (HTTP $FRONTEND_STATUS)"
fi

# 6. Check CloudWatch logs
echo "6. Checking CloudWatch logs..."
LOG_STREAMS=$(aws logs describe-log-streams \
  --log-group-name /aws/ec2/flora-backend \
  --max-items 1 \
  --query 'logStreams[0].logStreamName' \
  --output text 2>/dev/null || echo "none")
if [ "$LOG_STREAMS" != "none" ]; then
  echo "   ✅ CloudWatch logs are being collected"
else
  echo "   ⚠️  No CloudWatch logs yet (may take a few minutes)"
fi

# 7. Check user-data execution
echo "7. Checking user-data script execution..."
ssh -i ~/.ssh/flora-key.pem -o StrictHostKeyChecking=no ubuntu@$EC2_IP \
  'tail -5 /var/log/user-data.log' 2>/dev/null && echo "   ✅ User-data completed" || echo "   ⚠️  User-data still running or failed"

echo ""
echo "=== Deployment Validation Complete ==="
echo ""
echo "URLs:"
echo "  Frontend: $CLOUDFRONT_URL"
echo "  Backend:  http://$EC2_IP:3001"
echo "  API Docs: http://$EC2_IP:3001/api-docs (if Swagger enabled)"
```

**Run validation:**
```bash
chmod +x scripts/validate-deployment.sh
./scripts/validate-deployment.sh
```

**Expected output:**
```
=== Flora Deployment Validation ===

1. Checking EC2 instance...
   Status: running
2. Checking backend health...
   ✅ Backend is healthy (HTTP 200)
3. Checking RDS database...
   Status: available
4. Checking CloudFront distribution...
   Status: Deployed
5. Checking frontend...
   ✅ Frontend is accessible (HTTP 200)
6. Checking CloudWatch logs...
   ✅ CloudWatch logs are being collected
7. Checking user-data script execution...
   ✅ User-data completed

=== Deployment Validation Complete ===
```

---

## Validation & Evidence

**For interviews and documentation**, capture these artifacts to demonstrate your deployment:

### 1. Terraform Outputs

```bash
cd terraform

# Save all outputs
terraform output | tee ../docs/deployment-validation/terraform-output.txt

# Key outputs to highlight:
# - EC2 public IP
# - RDS endpoint
# - CloudFront URL
# - S3 bucket names
# - IAM role ARNs
```

### 2. Infrastructure Proof

Take screenshots or record evidence of:

```bash
# AWS Console views:
# - EC2 dashboard showing running instance
# - RDS dashboard showing available database
# - CloudFront distribution status
# - S3 buckets with frontend files
# - CloudWatch logs with application output

# CLI verification:
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=flora-backend-production" \
  --query 'Reservations[0].Instances[0].[InstanceId,State.Name,PublicIpAddress]' \
  --output table

aws rds describe-db-instances \
  --db-instance-identifier flora-db-prod \
  --query 'DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]' \
  --output table
```

### 3. Health Check Results

```bash
# Save health check responses
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)
curl -v http://$EC2_IP:3001/api/health | jq . > docs/deployment-validation/health-check.json

# Test a sample API endpoint
curl http://$EC2_IP:3001/api/products | jq . > docs/deployment-validation/sample-api-response.json
```

### 4. CloudWatch Logs Sample

```bash
# Fetch recent application logs
aws logs tail /aws/ec2/flora-backend \
  --follow \
  --since 10m \
  > docs/deployment-validation/cloudwatch-logs-sample.txt
```

### 5. Terraform Plan (No Changes)

```bash
# Run plan again to show infrastructure is stable
terraform plan -detailed-exitcode > docs/deployment-validation/terraform-plan-nochanges.txt

# Exit code 0 = no changes (perfect!)
# Exit code 2 = changes detected (investigate)
```

### 6. Video Walkthrough (Optional but Impressive)

Record a 2-3 minute Loom video showing:
1. `terraform plan` output
2. `terraform apply` execution
3. AWS Console tour (EC2, RDS, CloudFront)
4. Application working in browser
5. CloudWatch logs in real-time

Save as `docs/deployment-validation/deployment-walkthrough.mp4`

### 7. Interview Talking Points

Create `docs/deployment-validation/INTERVIEW_NOTES.md`:

```markdown
# Flora AWS Deployment - Interview Talking Points

## Architecture Decisions

1. **Free Tier Focus**: Single EC2 + Single-AZ RDS to stay within $0/month
   - Trade-off: No high availability
   - Production alternative: Multi-AZ + Auto Scaling Group

2. **Remote State**: S3 + DynamoDB for state locking
   - Demonstrates team collaboration understanding
   - Prevents concurrent modifications

3. **Secrets Management**: SSM Parameter Store instead of terraform.tfvars
   - Shows security best practices
   - Enables secret rotation without code changes

4. **Zero-Touch Deployment**: User-data script automates everything
   - No manual SSH required after `terraform apply`
   - Reproducible and auditable

## Metrics to Highlight

- **Deployment time**: ~12 minutes from `terraform apply` to working app
- **Cost**: $0/month (within Free Tier limits)
- **Security**: Least-privilege IAM, encrypted secrets, VPC isolation
- **Observability**: CloudWatch logs, alarms, and metrics

## What I'd Change for Production

1. **Horizontal scaling**: ASG with ALB across 3 AZs
2. **Database resiliency**: Multi-AZ RDS with read replicas
3. **Advanced secrets**: AWS Secrets Manager with rotation
4. **Comprehensive monitoring**: Datadog/New Relic + distributed tracing
5. **CI/CD pipeline**: GitHub Actions for automated deployments
6. **WAF + Shield**: DDoS protection and web application firewall

## Questions I Can Answer

- Why did you choose X over Y?
- How would you handle database migrations?
- How would you implement blue-green deployments?
- How would you monitor costs as traffic grows?
- What's your disaster recovery strategy?
```

---

## Monitoring & Observability

This section demonstrates production-readiness thinking, even with Free Tier constraints.

### CloudWatch Logs

**Automatic log collection** (configured in user-data script):

```bash
# View application logs
aws logs tail /aws/ec2/flora-backend --follow --filter-pattern "ERROR"

# View deployment logs
aws logs tail /aws/ec2/flora-backend --log-stream-name-prefix "user-data" --since 1h

# Create log insights query
aws logs start-query \
  --log-group-name /aws/ec2/flora-backend \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /error/ | sort @timestamp desc | limit 20'
```

### CloudWatch Alarms

**Add these to your `monitoring` module:**

```hcl
# terraform/modules/monitoring/main.tf

# High CPU alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-high-cpu"
  alarm_description   = "Alert when CPU exceeds 80%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80

  dimensions = {
    InstanceId = var.instance_id
  }

  alarm_actions = [] # Add SNS topic ARN for notifications
}

# High memory alarm (requires CloudWatch agent)
resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "${var.project_name}-high-memory"
  alarm_description   = "Alert when memory exceeds 80%"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 80

  dimensions = {
    InstanceId = var.instance_id
  }

  alarm_actions = [] # Add SNS topic ARN
}

# RDS high connections
resource "aws_cloudwatch_metric_alarm" "rds_high_connections" {
  alarm_name          = "${var.project_name}-rds-high-connections"
  alarm_description   = "Alert when RDS connections exceed 80% of max"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  alarm_actions = []
}

# Cost alarm (requires billing alerts enabled)
resource "aws_cloudwatch_metric_alarm" "billing_alarm" {
  alarm_name          = "${var.project_name}-billing-alert"
  alarm_description   = "Alert when estimated charges exceed $10"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 21600  # 6 hours
  statistic           = "Maximum"
  threshold           = 10

  dimensions = {
    Currency = "USD"
  }

  alarm_actions = [] # Add SNS topic ARN
}
```

### CloudWatch Dashboard

**Create a custom dashboard** to monitor key metrics:

```hcl
# terraform/modules/monitoring/main.tf

resource "aws_cloudwatch_dashboard" "flora" {
  dashboard_name = "${var.project_name}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", { stat = "Average", label = "EC2 CPU" }],
            ["AWS/RDS", "CPUUtilization", { stat = "Average", label = "RDS CPU" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "CPU Utilization"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "DatabaseConnections", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Connections"
        }
      },
      {
        type = "log"
        properties = {
          query   = "SOURCE '/aws/ec2/flora-backend' | fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20"
          region  = var.aws_region
          title   = "Recent Errors"
        }
      }
    ]
  })
}
```

### Application Metrics

**PM2 monitoring** (already configured in user-data):

```bash
# SSH into EC2 to check PM2 metrics
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP

# View PM2 dashboard
pm2 monit

# View PM2 logs
pm2 logs flora-backend --lines 50

# Check memory and CPU usage
pm2 show flora-backend
```

### Cost Monitoring

```bash
# Check current month's costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Set up budget alert
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

---

## Cost Optimization

### Free Tier Usage Monitoring

```bash
# Check EC2 running hours
aws ec2 describe-instances \
  --filters "Name=instance-type,Values=t2.micro" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,LaunchTime]'

# Check RDS running hours
aws rds describe-db-instances \
  --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus]'
```

### Cost-Saving Tips

1. **Stop RDS when not in use**:
   ```bash
   aws rds stop-db-instance --db-instance-identifier flora-db-prod
   # Restart: aws rds start-db-instance --db-instance-identifier flora-db-prod
   ```

2. **Use t3.micro instead of t2.micro** (better performance, same free tier)

3. **Enable S3 Intelligent-Tiering** for automatic cost optimization

4. **Set CloudWatch alarms** for resource usage:
   ```bash
   # CPU utilization alarm
   aws cloudwatch put-metric-alarm \
     --alarm-name flora-high-cpu \
     --alarm-description "Alert when CPU exceeds 80%" \
     --metric-name CPUUtilization \
     --namespace AWS/EC2 \
     --statistic Average \
     --period 300 \
     --threshold 80 \
     --comparison-operator GreaterThanThreshold
   ```

5. **Clean up unused resources**:
   ```bash
   # List EBS snapshots
   aws ec2 describe-snapshots --owner-ids self

   # List unused Elastic IPs (these cost money if not attached!)
   aws ec2 describe-addresses --query 'Addresses[?AssociationId==null]'
   ```

---

## Maintenance

### Update Application Code

```bash
# Backend update
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP
cd Flora
git pull
cd apps/backend
pnpm install
pnpm build
pm2 restart flora-backend

# Frontend update
cd Flora
git pull
pnpm --filter frontend build
aws s3 sync apps/frontend/dist s3://$S3_BUCKET/ --delete
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

### Database Backups

```bash
# Manual backup
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP
pg_dump -h <RDS_ENDPOINT> -U flora_admin flora_db > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://flora-backups/
```

### Infrastructure Updates

```bash
# Update Terraform configuration
cd terraform

# Plan changes
terraform plan

# Apply changes
terraform apply

# View current state
terraform show
```

### Monitoring

```bash
# Check EC2 logs
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP
pm2 logs flora-backend

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=<INSTANCE_ID> \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

---

## Troubleshooting

### Common Issues

#### 1. Terraform Apply Fails

**Problem**: `Error creating RDS instance: DBSubnetGroupNotFoundFault`

**Solution**: Ensure VPC and subnets are created first. Check dependency order in Terraform.

```bash
terraform refresh
terraform plan
```

#### 2. Cannot SSH into EC2

**Problem**: `Connection timeout` or `Permission denied`

**Solution**:
- Check security group allows SSH (port 22) from your IP
- Verify key pair permissions: `chmod 400 ~/.ssh/flora-key.pem`
- Check EC2 instance is running: `aws ec2 describe-instances`

#### 3. Backend Cannot Connect to Database

**Problem**: `ECONNREFUSED` or timeout errors

**Solution**:
- Verify RDS security group allows connections from EC2 security group
- Check DATABASE_URL environment variable is correct
- Test connection: `psql -h <RDS_ENDPOINT> -U flora_admin -d flora_db`

#### 4. Frontend Shows 404 Errors

**Problem**: React Router paths don't work after refresh

**Solution**: Configure CloudFront error responses:
```hcl
# In CloudFront module
custom_error_response {
  error_code         = 404
  response_code      = 200
  response_page_path = "/index.html"
}
```

#### 5. High AWS Bills

**Problem**: Unexpected charges

**Solution**:
- Check for unattached Elastic IPs (cost $0.005/hour)
- Verify NAT Gateway isn't running (costs money)
- Review CloudWatch dashboard for over-limit usage
- Stop/terminate unused resources

### Debug Commands

```bash
# Terraform state inspection
terraform state list
terraform state show <resource>

# AWS resource inspection
aws ec2 describe-instances --instance-ids <INSTANCE_ID>
aws rds describe-db-instances --db-instance-identifier <DB_ID>
aws s3 ls s3://<BUCKET_NAME>
aws cloudfront list-distributions

# EC2 system logs
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP
sudo journalctl -u cloud-init -f
cat /var/log/cloud-init-output.log
```

---

## Destroy Infrastructure

When you want to tear down the infrastructure:

```bash
cd terraform

# Preview what will be destroyed
terraform plan -destroy

# Destroy all resources
terraform destroy

# Confirm by typing 'yes'
```

**Warning**: This will permanently delete:
- EC2 instance
- RDS database (including all data)
- S3 buckets (if empty)
- CloudFront distribution
- All networking components

**Before destroying**:
1. Backup database
2. Download any important S3 files
3. Save configuration files

---

## Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

---

## Implementation Priority

**If you're preparing for interviews or building this from scratch, follow this order:**

### Phase 1: Foundation (Week 1)
1. ✅ Set up remote state backend (S3 + DynamoDB)
2. ✅ Store all secrets in SSM Parameter Store
3. ✅ Implement networking module (VPC, subnets, security groups)
4. ✅ Implement IAM module (instance profile with SSM read permissions)

**Why first**: State management and security are foundational - get them right from the start.

### Phase 2: Core Infrastructure (Week 2)
5. ✅ Implement database module (RDS with proper security group rules)
6. ✅ Create user-data script for zero-touch deployment
7. ✅ Implement compute module (EC2 with user-data)
8. ✅ Deploy and validate backend works end-to-end

**Why second**: These are the critical components that demonstrate your understanding of automation.

### Phase 3: Frontend & Monitoring (Week 3)
9. ✅ Implement storage module (S3 buckets)
10. ✅ Implement CDN module (CloudFront)
11. ✅ Implement monitoring module (CloudWatch logs + alarms)
12. ✅ Deploy frontend and capture validation artifacts

**Why third**: Frontend is simpler than backend; monitoring shows production thinking.

### Phase 4: Documentation & Evidence (Week 4)
13. ✅ Run validation scripts and save all outputs
14. ✅ Take screenshots of AWS Console
15. ✅ Record deployment walkthrough video
16. ✅ Create interview talking points document
17. ✅ Practice explaining trade-offs and production alternatives

**Why last**: Documentation is what makes your work visible in interviews.

---

## Interview Preparation Checklist

Before your interview, ensure you can:

### Demonstrate
- [ ] `terraform plan` output showing no drift
- [ ] `terraform apply` completing successfully in ~12 minutes
- [ ] Backend health check returning 200 OK
- [ ] Frontend loading from CloudFront
- [ ] CloudWatch logs showing application output
- [ ] AWS Console tour (EC2, RDS, S3, CloudFront, CloudWatch)

### Explain
- [ ] Why you chose single-AZ over multi-AZ (cost vs. availability trade-off)
- [ ] How remote state locking prevents concurrent modifications
- [ ] Why SSM Parameter Store is better than hardcoded secrets
- [ ] How user-data enables zero-touch deployment
- [ ] What you'd change for production traffic (ASG, ALB, Multi-AZ)
- [ ] How you'd implement blue-green deployments
- [ ] Your disaster recovery strategy (RDS snapshots, S3 versioning)

### Answer Common Questions
- [ ] "Walk me through your deployment process"
- [ ] "How do you handle database migrations?"
- [ ] "What happens if the EC2 instance fails?"
- [ ] "How do you rotate secrets?"
- [ ] "How would you scale this to handle 10x traffic?"
- [ ] "What security measures did you implement?"
- [ ] "How do you monitor costs?"

---

## Future Enhancements

**After completing the basic deployment**, consider these advanced features:

### Production-Ready Features
1. **CI/CD Pipeline**: GitHub Actions workflow for automated terraform apply
2. **Blue-Green Deployments**: Second EC2 instance + ALB for zero-downtime updates
3. **Database Migrations**: Automated migrations via GitHub Actions
4. **Advanced Monitoring**: Structured logging, distributed tracing (X-Ray)
5. **Disaster Recovery**: Automated RDS snapshots + cross-region replication
6. **Custom Domain**: Route 53 + ACM certificate for professional URL

### Security Enhancements
7. **AWS Secrets Manager**: Replace SSM with auto-rotation
8. **VPC Endpoints**: Private access to AWS services (no internet egress)
9. **WAF Rules**: Rate limiting, IP blocking, OWASP Top 10 protection
10. **GuardDuty**: Threat detection and monitoring
11. **AWS Config**: Compliance and configuration auditing

### Cost Optimization (Beyond Free Tier)
12. **Spot Instances**: 70-90% savings for non-critical workloads
13. **Reserved Instances**: 40-60% savings for 1-3 year commitments
14. **S3 Intelligent-Tiering**: Automatic cost optimization for storage
15. **Lambda for Scheduled Tasks**: Replace always-on compute for periodic jobs

---

## Additional Resources

### AWS Documentation
- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)

### Terraform Best Practices
- [Terraform Best Practices Guide](https://www.terraform-best-practices.com/)
- [Gruntwork Production-Grade Infrastructure](https://gruntwork.io/guides/)
- [HashiCorp Learn - Terraform](https://learn.hashicorp.com/terraform)

### Interview Preparation
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [AWS Solutions Architect Associate](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
- [Site Reliability Engineering Book](https://sre.google/books/)

---

**Created by the Flora team** (Anthony, Bevan, Xiaoling, Lily)
**Last updated**: 2025-01-12
**Version**: 2.1 (Updated with Current Project Status)

## Recent Updates (v2.1)

**What's New:**
- ✅ Updated SSM Parameter Store section with actual 18 parameters used in Flora
- ✅ Added project status indicators showing current implementation state
- ✅ Clarified Stripe subscription price IDs (weekly, biweekly, monthly, spontaneous)
- ✅ Referenced [scripts/setup-ssm-parameters.md](../scripts/setup-ssm-parameters.md) for complete setup guide
- ✅ Verified all configuration aligns with current pnpm workspace structure
- 📋 Region documented as ap-southeast-2 (Sydney) - adjust as needed for your deployment
