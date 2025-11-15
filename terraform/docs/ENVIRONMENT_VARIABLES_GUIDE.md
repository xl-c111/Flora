# Environment Variables Management Guide

This guide provides step-by-step instructions for managing environment variables in the Flora application for both local development and production (AWS) environments.

## Table of Contents
- [Overview](#overview)
- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Quick Reference Commands](#quick-reference-commands)

---

## Overview

### Important: Placeholder Values

This guide uses placeholders like `<YOUR_CLOUDFRONT_DOMAIN>`, `<RDS_ENDPOINT>`, and `<EC2_IP_ADDRESS>` instead of actual infrastructure details for security reasons. Replace these with your actual values when running commands.

**Get your actual infrastructure values:**
```bash
# Get RDS Endpoint
aws rds describe-db-instances \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-southeast-2

# Get EC2 Public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=flora-backend-production" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region ap-southeast-2

# Get CloudFront Domain (from your terraform outputs or AWS Console)
# Or check your GitHub workflow file: .github/workflows/deploy.yml
```

### Storage Locations

| Environment | Backend | Frontend |
|-------------|---------|----------|
| **Local Development** | `apps/backend/.env` | `apps/frontend/.env` |
| **Production (AWS)** | AWS Systems Manager Parameter Store | GitHub Secrets |

### Architecture
- **Backend**: Runs on EC2 with PM2, environment loaded from `.env` file generated from AWS SSM
- **Frontend**: Built with Vite, deployed to S3/CloudFront, environment baked into build from GitHub Secrets

---

## Backend Environment Variables

### Available Variables

| Variable | Type | Description | SSM Parameter Path |
|----------|------|-------------|-------------------|
| `DATABASE_URL` | Generated | PostgreSQL connection string | `/flora/prod/db_username`, `/flora/prod/db_password` |
| `AUTH0_DOMAIN` | Plain | Auth0 domain | `/flora/prod/auth0_domain` |
| `AUTH0_CLIENT_ID` | Plain | Auth0 client ID | `/flora/prod/auth0_client_id` |
| `AUTH0_CLIENT_SECRET` | Secure | Auth0 client secret | `/flora/prod/auth0_client_secret` |
| `AUTH0_AUDIENCE` | Plain | Auth0 API audience | `/flora/prod/auth0_audience` |
| `STRIPE_SECRET_KEY` | Secure | Stripe secret key | `/flora/prod/stripe_secret_key` |
| `STRIPE_PUBLISHABLE_KEY` | Plain | Stripe publishable key | `/flora/prod/stripe_publishable_key` |
| `STRIPE_WEBHOOK_SECRET` | Secure | Stripe webhook secret | `/flora/prod/stripe_webhook_secret` |
| `STRIPE_WEEKLY_PRICE_ID` | Plain | Stripe weekly subscription price ID | `/flora/prod/stripe_weekly_price_id` |
| `STRIPE_BIWEEKLY_PRICE_ID` | Plain | Stripe bi-weekly subscription price ID | `/flora/prod/stripe_biweekly_price_id` |
| `STRIPE_MONTHLY_PRICE_ID` | Plain | Stripe monthly subscription price ID | `/flora/prod/stripe_monthly_price_id` |
| `STRIPE_SPONTANEOUS_PRICE_ID` | Plain | Stripe spontaneous order price ID | `/flora/prod/stripe_spontaneous_price_id` |
| `GMAIL_USER` | Plain | Gmail email address | `/flora/prod/gmail_user` |
| `GMAIL_PASSWORD` | Secure | Gmail app password | `/flora/prod/gmail_password` |
| `GEMINI_API_KEY` | Secure | Google Gemini AI API key | `/flora/prod/gemini_api_key` |
| `JWT_SECRET` | Secure | JWT signing secret | `/flora/prod/jwt_secret` |

### Updating Backend Variables Locally

#### Step 1: Edit the `.env` file
```bash
# Navigate to backend directory
cd apps/backend

# Edit the .env file with your preferred editor
nano .env
# or
code .env
```

#### Step 2: Update the value
```bash
# Example: Updating Gemini API key
GEMINI_API_KEY=your_new_api_key_here
```

#### Step 3: Restart the backend server
```bash
# If running in development mode, stop (Ctrl+C) and restart
pnpm dev

# If running in production mode with PM2
pm2 restart flora-backend --update-env
pm2 save
```

### Updating Backend Variables in Production (AWS)

#### Step 1: Update AWS SSM Parameter Store

**Option A: Using AWS CLI (Recommended)**
```bash
# Update a secure parameter (e.g., Gemini API key)
aws ssm put-parameter \
  --name "/flora/prod/gemini_api_key" \
  --value "your_new_api_key_here" \
  --type "SecureString" \
  --overwrite \
  --region ap-southeast-2

# Update a plain parameter (e.g., Auth0 domain)
aws ssm put-parameter \
  --name "/flora/prod/auth0_domain" \
  --value "your-tenant.auth0.com" \
  --type "String" \
  --overwrite \
  --region ap-southeast-2
```

**Option B: Using AWS Console**
1. Go to [AWS Systems Manager Console](https://console.aws.amazon.com/systems-manager/)
2. Select region: **ap-southeast-2** (Sydney)
3. Navigate to **Parameter Store** in the left menu
4. Search for the parameter (e.g., `/flora/prod/gemini_api_key`)
5. Click on the parameter name
6. Click **Edit**
7. Update the **Value** field
8. Click **Save changes**

#### Step 2: Get Your EC2 Instance Information

```bash
# Find your EC2 instance IP address
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=flora-backend-production" \
  --query 'Reservations[*].Instances[*].[PublicIpAddress,InstanceId,State.Name]' \
  --output table \
  --region ap-southeast-2
```

#### Step 3: Get Your RDS Endpoint

```bash
# Find your RDS endpoint
aws rds describe-db-instances \
  --query 'DBInstances[*].[DBInstanceIdentifier,Endpoint.Address]' \
  --output table \
  --region ap-southeast-2
```

#### Step 4: Deploy the Changes

**Option A: Automatic Deployment via GitHub Actions (Recommended)**

If you have branch protection on `main` (recommended):
```bash
# 1. Create a feature branch
git checkout -b update-env-vars

# 2. Make an empty commit to trigger deployment
git commit --allow-empty -m "Update environment variables"

# 3. Push the branch
git push origin update-env-vars

# 4. Create a pull request
gh pr create --title "Update environment variables" --body "Updated SSM parameters, triggering redeploy"

# 5. Merge the PR (via GitHub UI or CLI)
gh pr merge --merge --delete-branch
```

If you can push directly to `main`:
```bash
git commit --allow-empty -m "Update environment variables"
git push origin main
```

This will automatically:
- Pull latest code from GitHub
- Regenerate `.env` from AWS SSM Parameter Store
- Rebuild the backend
- Restart the PM2 process

**Option B: Manual Deployment via SSH**
```bash
# 1. SSH into your EC2 instance
ssh -i /path/to/your-key.pem ubuntu@<EC2_IP_ADDRESS>

# 2. Navigate to the project directory
cd /home/ubuntu/Flora

# 3. Pull latest code (optional)
git pull origin main

# 4. Run the deployment script
./scripts/deploy-backend.sh prod ap-southeast-2 <RDS_ENDPOINT>

# Get your RDS endpoint first:
# RDS_ENDPOINT=$(aws rds describe-db-instances --query 'DBInstances[0].Endpoint.Address' --output text --region ap-southeast-2)
# ./scripts/deploy-backend.sh prod ap-southeast-2 $RDS_ENDPOINT
```

**Option C: Quick Restart (if only updating existing variables)**
```bash
# 1. SSH into your EC2 instance
ssh -i /path/to/your-key.pem ubuntu@<EC2_IP_ADDRESS>

# 2. Regenerate .env from SSM
cd /home/ubuntu/Flora
./scripts/generate-backend-env.sh prod ap-southeast-2 <RDS_ENDPOINT>

# 3. Restart PM2
pm2 restart flora-backend --update-env
pm2 save
```

#### Step 5: Verify the Changes

```bash
# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs flora-backend --lines 50

# Check if the backend is responding
curl https://<YOUR_CLOUDFRONT_DOMAIN>/api/health
```

---

## Frontend Environment Variables

### Available Variables

| Variable | Description | GitHub Secret Name |
|----------|-------------|-------------------|
| `VITE_AUTH0_DOMAIN` | Auth0 domain | `VITE_AUTH0_DOMAIN` |
| `VITE_AUTH0_CLIENT_ID` | Auth0 client ID | `VITE_AUTH0_CLIENT_ID` |
| `VITE_AUTH0_AUDIENCE` | Auth0 API audience | `VITE_AUTH0_AUDIENCE` |
| `VITE_API_URL` | Backend API URL | N/A (hardcoded in workflow) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `VITE_STRIPE_PUBLISHABLE_KEY` |
| `VITE_APP_NAME` | Application name | N/A (hardcoded in workflow) |
| `VITE_APP_URL` | Frontend URL | N/A (hardcoded in workflow) |

### Updating Frontend Variables Locally

#### Step 1: Edit the `.env` file
```bash
# Navigate to frontend directory
cd apps/frontend

# Edit the .env file
nano .env
# or
code .env
```

#### Step 2: Update the value
```bash
# Example: Updating Auth0 domain
VITE_AUTH0_DOMAIN=your-new-tenant.auth0.com
```

#### Step 3: Restart the development server
```bash
# Stop the current server (Ctrl+C) and restart
pnpm dev
```

### Updating Frontend Variables in Production (GitHub Secrets)

#### Step 1: Update GitHub Secrets

**Option A: Using GitHub CLI (gh)**
```bash
# Update a secret
gh secret set VITE_AUTH0_DOMAIN --body "your-new-tenant.auth0.com"
gh secret set VITE_AUTH0_CLIENT_ID --body "your_new_client_id"
gh secret set VITE_AUTH0_AUDIENCE --body "https://your-api.com"
gh secret set VITE_STRIPE_PUBLISHABLE_KEY --body "pk_test_your_key"
```

**Option B: Using GitHub Web Interface**
1. Go to your GitHub repository: `https://github.com/xl-c111/Flora`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** > **Actions**
4. Find the secret you want to update (e.g., `VITE_AUTH0_DOMAIN`)
5. Click **Update** (pencil icon)
6. Enter the new value
7. Click **Update secret**

#### Step 2: Update Hardcoded Values (if needed)

Some values like `VITE_API_URL` and `VITE_APP_URL` are hardcoded in the GitHub Actions workflow. To update them:

```bash
# Edit the deployment workflow
nano .github/workflows/deploy.yml

# Find and update these lines (around line 46-52):
# VITE_API_URL=https://<YOUR_CLOUDFRONT_DOMAIN>/api
# VITE_APP_URL=https://<YOUR_CLOUDFRONT_DOMAIN>

# Commit and push the changes
git add .github/workflows/deploy.yml
git commit -m "Update frontend production URLs"
git push origin main
```

#### Step 3: Deploy the Changes

**Option A: Automatic Deployment (Recommended)**

If you have branch protection on `main`:
```bash
# 1. Create and push a feature branch
git checkout -b update-frontend-env
git commit --allow-empty -m "Update frontend environment variables"
git push origin update-frontend-env

# 2. Create and merge PR
gh pr create --title "Update frontend environment variables" --body "Updated GitHub Secrets"
gh pr merge --merge --delete-branch
```

If you can push directly to `main`:
```bash
git push origin main
```

**Option B: Manual Deployment**
```bash
# Run the frontend deployment script
./scripts/deploy-frontend.sh invalidate
```

You'll need to set these environment variables before running the script:
```bash
export FRONTEND_BUCKET="your-s3-bucket-name"
export CLOUDFRONT_DIST_ID="your-cloudfront-distribution-id"
./scripts/deploy-frontend.sh invalidate
```

#### Step 4: Verify the Changes

```bash
# Wait for CloudFront invalidation to complete (5-10 minutes)
# Then check your frontend application
open https://<YOUR_CLOUDFRONT_DOMAIN>

# Verify the environment variables in browser console
# Open DevTools > Console and type:
# import.meta.env
```

---

## Quick Reference Commands

### View All Backend SSM Parameters
```bash
aws ssm describe-parameters \
  --parameter-filters "Key=Name,Option=BeginsWith,Values=/flora/prod/" \
  --region ap-southeast-2 \
  --output table
```

### View a Specific Backend SSM Parameter
```bash
# Plain text parameter
aws ssm get-parameter \
  --name "/flora/prod/auth0_domain" \
  --query 'Parameter.Value' \
  --output text \
  --region ap-southeast-2

# Secure parameter (decrypted)
aws ssm get-parameter \
  --name "/flora/prod/gemini_api_key" \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text \
  --region ap-southeast-2
```

### View All GitHub Secrets
```bash
# List all secrets (values are hidden)
gh secret list
```

### Check Backend PM2 Status
```bash
# Via SSH
ssh -i /path/to/your-key.pem ubuntu@<EC2_IP> "pm2 status"

# View logs
ssh -i /path/to/your-key.pem ubuntu@<EC2_IP> "pm2 logs flora-backend --lines 100"
```

### Test Backend API
```bash
# Health check
curl https://<YOUR_CLOUDFRONT_DOMAIN>/api/health

# Check specific endpoint
curl https://<YOUR_CLOUDFRONT_DOMAIN>/api/products
```

### Check CloudFront Invalidation Status
```bash
# List recent invalidations
aws cloudfront list-invalidations \
  --distribution-id <CLOUDFRONT_DIST_ID> \
  --region us-east-1
```

---

## Common Scenarios

### Scenario 1: Updating Gemini AI API Key
```bash
# 1. Update in AWS SSM
aws ssm put-parameter \
  --name "/flora/prod/gemini_api_key" \
  --value "AIzaSy..." \
  --type "SecureString" \
  --overwrite \
  --region ap-southeast-2

# 2. Trigger deployment (with branch protection)
git checkout -b update-gemini-key
git commit --allow-empty -m "Update Gemini API key"
git push origin update-gemini-key
gh pr create --title "Update Gemini API key" --body "Rotated Gemini API key in SSM"
gh pr merge --merge --delete-branch

# 3. Wait for deployment to complete (~3-5 minutes)
# 4. Verify by testing AI message generation feature
```

### Scenario 2: Updating Auth0 Configuration
```bash
# Backend - Update SSM
aws ssm put-parameter --name "/flora/prod/auth0_domain" --value "new-tenant.auth0.com" --type "String" --overwrite --region ap-southeast-2
aws ssm put-parameter --name "/flora/prod/auth0_client_id" --value "new_client_id" --type "String" --overwrite --region ap-southeast-2
aws ssm put-parameter --name "/flora/prod/auth0_client_secret" --value "new_secret" --type "SecureString" --overwrite --region ap-southeast-2

# Frontend - Update GitHub Secrets
gh secret set VITE_AUTH0_DOMAIN --body "new-tenant.auth0.com"
gh secret set VITE_AUTH0_CLIENT_ID --body "new_client_id"

# Deploy both (with branch protection)
git checkout -b update-auth0
git commit --allow-empty -m "Update Auth0 configuration"
git push origin update-auth0
gh pr create --title "Update Auth0 configuration" --body "Updated Auth0 credentials in SSM and GitHub Secrets"
gh pr merge --merge --delete-branch
```

### Scenario 3: Updating Stripe Keys
```bash
# Backend - Update SSM
aws ssm put-parameter --name "/flora/prod/stripe_secret_key" --value "sk_live_..." --type "SecureString" --overwrite --region ap-southeast-2
aws ssm put-parameter --name "/flora/prod/stripe_publishable_key" --value "pk_live_..." --type "String" --overwrite --region ap-southeast-2
aws ssm put-parameter --name "/flora/prod/stripe_webhook_secret" --value "whsec_..." --type "SecureString" --overwrite --region ap-southeast-2

# Frontend - Update GitHub Secrets
gh secret set VITE_STRIPE_PUBLISHABLE_KEY --body "pk_live_..."

# Deploy both (with branch protection)
git checkout -b update-stripe-keys
git commit --allow-empty -m "Update Stripe keys"
git push origin update-stripe-keys
gh pr create --title "Update Stripe keys" --body "Updated Stripe credentials in SSM and GitHub Secrets"
gh pr merge --merge --delete-branch
```

---

## Troubleshooting

### Backend Not Picking Up New Environment Variables
```bash
# 1. Verify the SSM parameter was updated
aws ssm get-parameter --name "/flora/prod/gemini_api_key" --with-decryption --region ap-southeast-2

# 2. SSH into EC2 and check the .env file
ssh -i key.pem ubuntu@<EC2_IP>
cat /home/ubuntu/Flora/apps/backend/.env

# 3. Regenerate .env and restart
cd /home/ubuntu/Flora
./scripts/generate-backend-env.sh prod ap-southeast-2 <RDS_ENDPOINT>
pm2 restart flora-backend --update-env
```

### Frontend Not Showing New Values
```bash
# 1. Verify GitHub secret was updated
gh secret list

# 2. Check the latest GitHub Actions workflow run
gh run list --limit 5

# 3. View workflow logs
gh run view <run-id> --log

# 4. Clear CloudFront cache manually
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/*" \
  --region us-east-1
```

### Permission Denied When Accessing SSM
```bash
# Verify AWS credentials are configured
aws sts get-caller-identity

# Ensure your IAM user/role has these permissions:
# - ssm:GetParameter
# - ssm:PutParameter
# - ssm:DescribeParameters
```

---

## Branch Protection Workflow

### Why Branch Protection?
Branch protection on `main` is a security best practice that:
- Prevents accidental direct pushes to production
- Requires code review (if configured)
- Maintains a clean deployment history
- Enables automated checks before deployment

### Quick Deployment with Branch Protection

**Method 1: PR Workflow (Recommended)**
```bash
git checkout -b deploy-env-update
git commit --allow-empty -m "Deploy: Updated environment variables"
git push origin deploy-env-update
gh pr create --title "Deploy: Environment update" --body "Trigger deployment after SSM/Secrets update"
gh pr merge --merge --delete-branch
```

**Method 2: Direct SSH Deployment (Bypass GitHub Actions)**
If you need immediate deployment without waiting for PR merge:
```bash
# SSH into EC2 and run deployment script directly
ssh -i your-key.pem ubuntu@<EC2_IP>
cd /home/ubuntu/Flora
./scripts/deploy-backend.sh prod ap-southeast-2 <RDS_ENDPOINT>
```

**Method 3: Temporarily Disable Branch Protection**
Not recommended, but if you have admin access:
```bash
# Disable via GitHub CLI
gh api repos/xl-c111/Flora/branches/main/protection -X DELETE

# Make your push
git push origin main

# Re-enable protection
gh api repos/xl-c111/Flora/branches/main/protection -X PUT --input protection-config.json
```

---

## Security Best Practices

1. **Never commit `.env` files to Git** - They are in `.gitignore` for a reason
2. **Use SecureString for sensitive values** - API keys, passwords, secrets should use `SecureString` type
3. **Rotate secrets regularly** - Especially API keys and passwords
4. **Use different keys for dev/staging/prod** - Never reuse production credentials in development
5. **Limit IAM permissions** - Only grant necessary SSM parameter access
6. **Monitor SSM parameter changes** - Enable AWS CloudTrail for audit logging
7. **Enable branch protection** - Prevent direct pushes to `main`, require PR reviews
8. **Use GitHub environment protection rules** - Require approval for production deployments

---

## Additional Resources

- [AWS SSM Parameter Store Documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [GitHub Encrypted Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [PM2 Process Management](https://pm2.keymetrics.io/docs/usage/process-management/)
