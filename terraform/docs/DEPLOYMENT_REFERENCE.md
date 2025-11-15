# Deployment Reference

Quick reference for deploying Flora's frontend and backend to AWS.

---

## Quick Deploy Commands

### Frontend (S3 + CloudFront)

Deploy frontend from your **local machine**:

```bash
./scripts/deploy-frontend.sh invalidate
```

**What it does:**
- ✅ Builds frontend bundle (`pnpm --filter frontend build`)
- ✅ Auto-detects S3 bucket and CloudFront distribution
- ✅ Syncs files to S3
- ✅ Invalidates CloudFront cache

**Time:** ~2-3 minutes

---

### Backend (EC2 + PM2)

Deploy backend from your **local machine**:

```bash
./scripts/deploy-backend.sh
```

**What it does:**
- ✅ Auto-detects EC2 IP address
- ✅ Auto-detects SSH key
- ✅ SSHs into EC2 automatically
- ✅ Pulls latest code from main
- ✅ Regenerates `.env` from AWS SSM Parameter Store
- ✅ Rebuilds Prisma client and backend
- ✅ Restarts PM2 process
- ✅ Shows deployment status and logs

**Time:** ~1-2 minutes

**No SSH knowledge needed!** The script handles everything.

---

### Update Environment Variables

Update backend environment variables and trigger deployment:

```bash
./scripts/update-env-simple.sh <param-name> <value>
```

**Examples:**
```bash
./scripts/update-env-simple.sh gemini_api_key "new-key"
./scripts/update-env-simple.sh auth0_domain "tenant.auth0.com"
./scripts/update-env-simple.sh stripe_secret_key "sk_live_..."
```

**What it does:**
- ✅ Updates AWS SSM Parameter Store
- ✅ Creates git branch `update-env-vars`
- ✅ Creates GitHub PR automatically
- ✅ After you merge: triggers deployment via GitHub Actions

**Time:** 5-10 minutes (after merging PR)

---

## When to Redeploy

| Change | Redeploy Frontend? | Redeploy Backend? |
|--------|--------------------|-------------------|
| UI/UX (React/CSS/assets) | ✅ | ❌ |
| API logic / services | ❌ | ✅ |
| Prisma schema | ❌ | ✅ + run migrations |
| Backend env variables | ❌ | ✅ (via update script) |
| Frontend env variables | ✅ (via GitHub Actions) | ❌ |

---

## Automated Deployment (GitHub Actions)

Every push to `main` automatically triggers:
- ✅ Frontend build and deploy to S3/CloudFront
- ✅ Backend deployment to EC2 via SSH

**Workflow:** `.github/workflows/deploy.yml`

**When it runs:**
- On push to `main` branch
- When you merge PRs (including env update PRs)

---

## Database Migrations

If you have Prisma schema changes:

```bash
# SSH into EC2
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2-IP>
cd /home/ubuntu/Flora

# Apply migrations
pnpm --filter backend prisma migrate deploy

# Then redeploy backend
./scripts/deploy-backend.sh
```

---

## Manual Deployment (Detailed)

### Frontend - Step by Step

```bash
# 1. Build frontend
pnpm --filter frontend build

# 2. Deploy (auto-detects S3 bucket and CloudFront)
./scripts/deploy-frontend.sh invalidate
```

The script automatically:
- Finds your S3 bucket (searches for "flora" + "frontend")
- Finds your CloudFront distribution (searches for "flora")
- Uploads with proper cache headers
- Invalidates CloudFront cache

### Backend - Step by Step

**From your local machine:**
```bash
./scripts/deploy-backend.sh
```

The script automatically:
- Finds your RDS endpoint
- Finds your EC2 IP from AWS
- Finds your SSH key (checks common locations)
- SSHs into EC2
- Pulls latest code from GitHub
- Regenerates `.env` from SSM Parameter Store
- Rebuilds Prisma client
- Rebuilds backend TypeScript
- Restarts PM2 with new environment
- Shows status and logs

---

## Environment Variable Management

### Backend Variables (AWS SSM)

All backend environment variables are stored in **AWS Systems Manager Parameter Store** at:
```
/flora/prod/<parameter-name>
```

**Update any backend env variable:**
```bash
./scripts/update-env-simple.sh <parameter-name> <value>
```

See [Environment Variables Guide](ENVIRONMENT_VARIABLES_GUIDE.md) for complete list.

### Frontend Variables (GitHub Secrets)

Frontend environment variables are stored in **GitHub Secrets** and injected during build.

**Update frontend env variables:**
1. Update GitHub Secret (Settings > Secrets > Actions)
2. Trigger deployment by merging a PR to `main`

**Available secrets:**
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_STRIPE_PUBLISHABLE_KEY`

---

## Finding Your Infrastructure Details

### EC2 IP Address
```bash
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=flora-backend-production" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region ap-southeast-2
```

### S3 Bucket Name
```bash
aws s3 ls | grep flora
```

### CloudFront Distribution ID
```bash
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,Comment]' \
  --output table
```

### RDS Endpoint
```bash
aws rds describe-db-instances \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-southeast-2
```

---

## Troubleshooting

### Frontend deployment fails

**Issue:** S3 bucket not found
```bash
# Manually specify bucket
export FRONTEND_BUCKET="your-bucket-name"
./scripts/deploy-frontend.sh invalidate
```

**Issue:** CloudFront invalidation fails
```bash
# Manually specify distribution ID
export CLOUDFRONT_DIST_ID="E1234567890ABC"
./scripts/deploy-frontend.sh invalidate
```

### Backend deployment fails

**Issue:** Cannot SSH to EC2
```bash
# Check EC2 is running
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=flora-backend-production" \
  --query 'Reservations[0].Instances[0].State.Name' \
  --region ap-southeast-2

# Check security group allows SSH from your IP
```

**Issue:** RDS endpoint not found
```bash
# Manually specify RDS endpoint
./scripts/deploy-backend.sh prod ap-southeast-2 your-rds-endpoint.amazonaws.com
```

### Environment variable updates not working

**Issue:** SSM parameter update permission denied
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check SSM permissions
aws ssm describe-parameters --region ap-southeast-2
```

**Issue:** GitHub PR not created
```bash
# Install GitHub CLI
brew install gh
gh auth login
```

---

## CI/CD Pipeline

### GitHub Actions Secrets Required

| Secret | Purpose | Where Used |
|--------|---------|------------|
| `AWS_ACCESS_KEY_ID` | AWS credentials | Frontend & backend deploy |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | Frontend & backend deploy |
| `FRONTEND_BUCKET` | S3 bucket name | Frontend deploy |
| `CLOUDFRONT_DIST_ID` | CloudFront distribution | Frontend deploy |
| `EC2_HOST` | EC2 IP address | Backend deploy |
| `EC2_USER` | SSH user (ubuntu) | Backend deploy |
| `EC2_SSH_KEY` | Private key contents | Backend deploy |
| `RDS_ENDPOINT` | RDS endpoint URL | Backend deploy |
| `VITE_*` | Frontend env variables | Frontend build |

### Workflow Files

- `.github/workflows/deploy.yml` - Main deployment workflow (frontend + backend)
- `.github/workflows/ci.yml` - CI testing and linting
- `.github/workflows/security.yml` - Security scanning

---

## Additional Resources

- [Full Environment Variables Guide](ENVIRONMENT_VARIABLES_GUIDE.md) - Complete env var management
- [AWS Terraform Deployment](AWS_TERRAFORM_DEPLOYMENT.md) - Infrastructure setup
- [Redeployment Scripts Reference](../../scripts/README-REDEPLOY.md) - Script documentation
- [AWS Deployment Flow](AWS_DEPLOYMENT_FLOW.md) - Architecture overview
