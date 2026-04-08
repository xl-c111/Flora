# Complete Guide: Setting Up Your Own Auth0 Account

This guide walks you through setting up your own Auth0 account for the Flora application, separate from your team's shared Auth0 configuration.

## Table of Contents
- [Prerequisites](#prerequisites)
- [When to Use This Guide](#when-to-use-this-guide)
- [Step 1: Create Auth0 Account and Application](#step-1-create-auth0-account-and-application)
- [Step 2: Create Auth0 API](#step-2-create-auth0-api)
- [Step 3: Update Frontend Environment Variables](#step-3-update-frontend-environment-variables)
- [Step 4: Update AWS SSM Parameters](#step-4-update-aws-ssm-parameters)
- [Step 5: Rebuild and Redeploy Frontend](#step-5-rebuild-and-redeploy-frontend)
- [Step 6: Backend Configuration (Future)](#step-6-backend-configuration-future)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS CLI configured with your credentials
- Terraform deployed (at least storage and CDN modules)
- CloudFront distribution URL (from `terraform output cloudfront_url`)
- Access to create Auth0 account

---

## When to Use This Guide

**Use your own Auth0 account if:**
- ✅ You want to test independently from your team
- ✅ You want separate user management
- ✅ You're experimenting with Auth0 configuration

**Use shared team Auth0 account if:**
- ✅ You want to share users with your team (recommended)
- ✅ You want consistent authentication across team deployments
- ✅ You want simpler setup

---

## Step 1: Create Auth0 Account and Application

### 1.1 Sign Up for Auth0

1. Go to https://auth0.com/signup
2. Create a new account (free tier is sufficient for development)
3. Complete the onboarding process

### 1.2 Create a New Application

1. In Auth0 Dashboard, navigate to **Applications** → **Applications**
2. Click **Create Application**
3. Configure:
   - **Name**: `Flora` (or any name you prefer)
   - **Application Type**: **Single Page Web Applications**
4. Click **Create**

### 1.3 Configure Application Settings

1. Go to the **Settings** tab of your new application

2. **Application URIs** - Add your URLs:

   **Allowed Callback URLs** (comma-separated):
   ```
   http://localhost:5173/callback, https://your-cloudfront-url.cloudfront.net/callback
   ```

   **Allowed Logout URLs** (comma-separated):
   ```
   http://localhost:5173, https://your-cloudfront-url.cloudfront.net
   ```

   **Allowed Web Origins** (comma-separated):
   ```
   http://localhost:5173, https://your-cloudfront-url.cloudfront.net
   ```

   Replace `your-cloudfront-url.cloudfront.net` with your actual CloudFront URL from:
   ```bash
   cd terraform && terraform output cloudfront_url
   ```

3. **Save Changes**

### 1.4 Note Your Credentials

Copy these values from the **Settings** tab (you'll need them later):

- **Domain**: (e.g., `dev-abc123.us.auth0.com`)
- **Client ID**: (long alphanumeric string)
- **Client Secret**: Click "Show" to reveal (in the Advanced Settings section if not visible)

---

## Step 2: Create Auth0 API

Your backend needs an Auth0 API configured to validate JWT tokens.

### 2.1 Create API

1. In Auth0 Dashboard, go to **Applications** → **APIs**
2. Click **Create API**
3. Configure:
   - **Name**: `Flora API`
   - **Identifier**: `https://flora-api.com`
     - ⚠️ **Important**: This must match exactly with `VITE_AUTH0_AUDIENCE` in your frontend
   - **Signing Algorithm**: `RS256`
4. Click **Create**

### 2.2 Configure API Permissions (Optional)

You can add custom scopes later if needed for fine-grained permissions.

---

## Step 3: Update Frontend Environment Variables

### 3.1 Edit Frontend .env File

Open `apps/frontend/.env` and update the Auth0 configuration:

```bash
# Auth - Replace with YOUR Auth0 credentials
VITE_AUTH0_DOMAIN=your-domain.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_AUTH0_AUDIENCE=https://flora-api.com

# API Configuration (keep this for now, update when backend is deployed)
VITE_API_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=Flora
VITE_APP_URL=http://localhost:5173

# Stripe (keep existing)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

**Replace:**
- `your-domain.us.auth0.com` → Your Auth0 domain from Step 1.4
- `your-client-id-here` → Your Auth0 Client ID from Step 1.4

---

## Step 4: Update AWS SSM Parameters

Your backend will read Auth0 credentials from AWS SSM Parameter Store. Update them with your new credentials.

### 4.1 Set Variables

```bash
# Set your AWS region
REGION=ap-southeast-2

# Your new Auth0 credentials from Step 1.4
AUTH0_DOMAIN="your-domain.us.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
AUTH0_AUDIENCE="https://flora-api.com"
```

### 4.2 Update SSM Parameters

```bash
# Update Auth0 domain
aws ssm put-parameter \
  --name "/flora/prod/auth0_domain" \
  --value "$AUTH0_DOMAIN" \
  --type "String" \
  --overwrite \
  --region $REGION

# Update Auth0 client ID
aws ssm put-parameter \
  --name "/flora/prod/auth0_client_id" \
  --value "$AUTH0_CLIENT_ID" \
  --type "String" \
  --overwrite \
  --region $REGION

# Update Auth0 client secret
aws ssm put-parameter \
  --name "/flora/prod/auth0_client_secret" \
  --value "$AUTH0_CLIENT_SECRET" \
  --type "SecureString" \
  --overwrite \
  --region $REGION

# Update Auth0 audience
aws ssm put-parameter \
  --name "/flora/prod/auth0_audience" \
  --value "$AUTH0_AUDIENCE" \
  --type "String" \
  --overwrite \
  --region $REGION
```

### 4.3 Verify Parameters

```bash
# List all Auth0 parameters to verify
aws ssm get-parameters \
  --names \
    "/flora/prod/auth0_domain" \
    "/flora/prod/auth0_client_id" \
    "/flora/prod/auth0_audience" \
  --region $REGION \
  --query 'Parameters[*].[Name,Value]' \
  --output table
```

---

## Step 5: Rebuild and Redeploy Frontend

After updating the `.env` file, rebuild and redeploy your frontend.

### 5.1 Build Frontend

```bash
cd /Users/xiaolingcui/Flora

# Install dependencies if needed
pnpm install

# Build frontend with new Auth0 configuration
pnpm --filter frontend build
```

### 5.2 Sync to S3

```bash
# Get S3 bucket name
S3_BUCKET=$(cd terraform && terraform output -raw frontend_bucket_name)

# Sync built files to S3
aws s3 sync apps/frontend/dist s3://$S3_BUCKET/ --delete
```

### 5.3 Invalidate CloudFront Cache

```bash
# Get CloudFront distribution ID
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

### 5.4 Wait for Invalidation

```bash
# Wait for invalidation to complete (optional)
aws cloudfront wait invalidation-completed \
  --distribution-id $DISTRIBUTION_ID \
  --id $(aws cloudfront list-invalidations \
    --distribution-id $DISTRIBUTION_ID \
    --query 'InvalidationList.Items[0].Id' \
    --output text)
```

---

## Step 6: Backend Configuration (Future)

When you deploy your backend infrastructure, it will automatically use the Auth0 credentials from AWS SSM Parameter Store.

### What Happens Automatically

- ✅ EC2 user-data script reads from SSM
- ✅ Backend validates JWT tokens using your Auth0 API
- ✅ No additional Auth0 configuration needed

### Backend Deployment (Not Yet Complete)

Your backend deployment will include:
- Networking module (VPC, subnets, security groups)
- Database module (RDS PostgreSQL)
- Compute module (EC2 with backend API)

---

## Troubleshooting

### Issue: "Callback URL mismatch" error

**Solution**: Verify your CloudFront URL in Auth0 matches exactly:
```bash
# Get your CloudFront URL
cd terraform && terraform output cloudfront_url
```
Add this URL (with `/callback` for callback URLs) to Auth0 application settings.

### Issue: "Invalid audience" error

**Solution**: Ensure `VITE_AUTH0_AUDIENCE` matches the API Identifier:
- Frontend `.env`: `VITE_AUTH0_AUDIENCE=https://flora-api.com`
- Auth0 API Identifier: `https://flora-api.com`
- Both must be **exactly** the same

### Issue: Frontend still shows old Auth0 login screen

**Solution**: Clear browser cache or open in incognito mode. The old Auth0 domain may be cached.

### Issue: "Invalid state" error after login

**Solution**:
1. Clear browser cookies and local storage
2. Ensure CloudFront cache was invalidated
3. Wait a few minutes for CloudFront invalidation to complete

### Issue: SSM parameter update failed

**Solution**: Check AWS credentials and region:
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Verify region
echo $REGION
```

---

## Summary of Changes

| Component | Before (Team) | After (Your Own) |
|-----------|--------------|------------------|
| **Auth0 Domain** | `dev-ijvur34mojpovh8e.us.auth0.com` | Your domain |
| **Auth0 Client ID** | `tegmEuc40IvXfYFDLIRnJmbsa1izkTVL` | Your client ID |
| **User Database** | Shared with team | Independent (your users only) |
| **AWS SSM Parameters** | Team's credentials | Your credentials |
| **Frontend .env** | Team's credentials | Your credentials |

---

## Important Notes

### Limitations

- ⚠️ **Users are NOT shared**: Users who sign up on your teammate's deployment won't exist in your Auth0 account
- ⚠️ **You'll manage users separately**: Each deployment has its own user database
- ⚠️ **Frontend still needs backend**: Auth0 setup alone won't make products load - you still need to deploy backend infrastructure

### Next Steps

After completing this guide:
1. ✅ Test authentication on your CloudFront URL
2. ⏭️ Deploy backend infrastructure (networking + database + compute)
3. ⏭️ Configure Stripe webhooks with your backend URL
4. ⏭️ Test the full application flow

---

## Reverting to Team Auth0

If you want to switch back to the team's shared Auth0:

1. Restore original values in `apps/frontend/.env`
2. Update SSM parameters with team's credentials
3. Rebuild and redeploy frontend

Keep a backup of the team's original Auth0 credentials before making changes!

---

## Additional Resources

- [Auth0 Single Page Application Quickstart](https://auth0.com/docs/quickstart/spa)
- [Auth0 APIs Documentation](https://auth0.com/docs/get-started/apis)
- [AWS SSM Parameter Store Documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
