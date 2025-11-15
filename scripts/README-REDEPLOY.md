# Deployment Scripts Reference

Simple one-command deployment scripts for Flora. All run from your local machine.

## 🚀 Quick Start

### Deploy Frontend
```bash
./scripts/deploy-frontend.sh invalidate
```

### Deploy Backend
```bash
./scripts/deploy-backend.sh
```

### Update Backend Environment Variables
```bash
./scripts/update-env-simple.sh <param-name> <value>
```

**Examples:**
```bash
# Update Gemini API key
./scripts/update-env-simple.sh gemini_api_key "AIzaSy..."

# Update Auth0 domain (backend)
./scripts/update-env-simple.sh auth0_domain "your-tenant.auth0.com"

# Update Stripe secret key
./scripts/update-env-simple.sh stripe_secret_key "sk_live_..."
```

### Update Frontend Environment Variables

Frontend variables are stored in **GitHub Secrets** (not AWS SSM).

**Method 1: GitHub Web UI (Recommended)**
1. Go to: `https://github.com/xl-c111/Flora/settings/secrets/actions`
2. Click on the secret (e.g., `VITE_AUTH0_DOMAIN`)
3. Click **Update**
4. Enter new value and save
5. Trigger deployment by merging a PR to `main`

**Method 2: GitHub CLI**
```bash
# Update secret
gh secret set VITE_AUTH0_DOMAIN --body "new-value"

# Trigger deployment
git checkout -b update-frontend-env
git commit --allow-empty -m "Update frontend environment variables"
git push origin update-frontend-env
gh pr create --title "Update frontend env" --body "Updated frontend environment variables"
gh pr merge --merge --delete-branch
```

**Available Frontend Secrets:**
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_STRIPE_PUBLISHABLE_KEY`

---

## 📋 Available Scripts

| Script | Runs From | Purpose |
|--------|-----------|---------|
| `deploy-frontend.sh` | Local machine | Deploy frontend to S3/CloudFront |
| `deploy-backend.sh` | Local machine | Deploy backend to EC2 (auto-detects everything) |
| `update-env-simple.sh` | Local machine | Update **backend** env vars + trigger deploy |

**Note:** Frontend environment variables are managed via GitHub Secrets (see below).

---

## 📖 How Scripts Work

### Frontend Deployment (`deploy-frontend.sh`)
1. ✅ Builds frontend bundle
2. ✅ Auto-detects S3 bucket from AWS
3. ✅ Auto-detects CloudFront distribution
4. ✅ Syncs files to S3
5. ✅ Invalidates CloudFront cache

**Time:** ~2-3 minutes

### Backend Deployment (`deploy-backend.sh`)
1. ✅ Auto-detects RDS endpoint
2. ✅ Auto-detects EC2 IP from AWS
3. ✅ Auto-detects SSH key (checks ~/.ssh/)
4. ✅ SSHs into EC2 automatically
5. ✅ Pulls latest code from GitHub
6. ✅ Regenerates .env from SSM
7. ✅ Rebuilds Prisma + backend
8. ✅ Restarts PM2 process
9. ✅ Shows deployment status

**Time:** ~1-2 minutes

### Backend Environment Variable Update (`update-env-simple.sh`)
1. ✅ Updates AWS SSM Parameter Store
2. ✅ Creates git branch `update-env-vars`
3. ✅ Pushes to GitHub
4. ✅ Gives you a PR link to merge
5. ✅ After merge: triggers GitHub Actions deployment

**Time:** 5-10 minutes (after merging PR)

### Frontend Environment Variable Update (GitHub Secrets)
1. ✅ Update secret in GitHub Settings or via `gh secret set`
2. ✅ Create PR to trigger rebuild
3. ✅ Merge PR: triggers GitHub Actions
4. ✅ Frontend rebuilds with new env values

**Time:** 5-10 minutes (after merging PR)

**All scripts require:**
- AWS CLI configured
- Proper AWS permissions (EC2, S3, SSM, RDS read access)
- GitHub CLI (`gh`) for frontend env updates (optional)

---

## 📋 Complete Workflow

Every time you update an environment variable:

**Step 1:** Run the script
```bash
./scripts/update-env-simple.sh gemini_api_key "new-value"
```

**Step 2:** Click the PR link shown in output
```
https://github.com/xl-c111/Flora/pull/new/update-env-vars
```

**Step 3:** Merge the PR in GitHub

**Step 4:** Wait for deployment (automatic via GitHub Actions)

That's it! ✅

---

## 📋 Environment Variables

### Backend Parameters (AWS SSM Parameter Store)

**Update with:** `./scripts/update-env-simple.sh <param-name> <value>`

| Parameter | Type | Description |
|-----------|------|-------------|
| `gemini_api_key` | SecureString | Google Gemini AI API key |
| `jwt_secret` | SecureString | JWT signing secret |
| `auth0_domain` | String | Auth0 tenant domain |
| `auth0_client_id` | String | Auth0 application client ID |
| `auth0_client_secret` | SecureString | Auth0 application secret |
| `auth0_audience` | String | Auth0 API audience |
| `stripe_secret_key` | SecureString | Stripe secret key |
| `stripe_publishable_key` | String | Stripe publishable key |
| `stripe_webhook_secret` | SecureString | Stripe webhook signing secret |
| `stripe_weekly_price_id` | String | Weekly subscription price ID |
| `stripe_biweekly_price_id` | String | Bi-weekly subscription price ID |
| `stripe_monthly_price_id` | String | Monthly subscription price ID |
| `stripe_spontaneous_price_id` | String | One-time order price ID |
| `gmail_user` | String | Gmail email address |
| `gmail_password` | SecureString | Gmail app password |
| `db_username` | String | Database username |
| `db_password` | SecureString | Database password |

### Frontend Secrets (GitHub Secrets)

**Update via:** GitHub Settings → Secrets → Actions, or `gh secret set`

| Secret | Description |
|--------|-------------|
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain |
| `VITE_AUTH0_CLIENT_ID` | Auth0 client ID |
| `VITE_AUTH0_AUDIENCE` | Auth0 API audience |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

**Note:** Frontend env variables are baked into the build. Changes require a new deployment (merge PR to `main`).

---

## 🎯 Common Scenarios

### Rotate Gemini API Key
```bash
./scripts/update-env-simple.sh gemini_api_key "new_api_key_here"
```

### Update Auth0 Domain
```bash
./scripts/update-env-simple.sh auth0_domain "new-tenant.auth0.com"
```

### Update Stripe Secret Key
```bash
./scripts/update-env-simple.sh stripe_secret_key "sk_live_..."
```

### Update JWT Secret
```bash
./scripts/update-env-simple.sh jwt_secret "new_secret_here"
```

---

## 🐛 Troubleshooting

### "Permission denied" when updating SSM

Verify your AWS credentials have SSM permissions:
```bash
aws sts get-caller-identity
```

### Branch already exists

The script automatically deletes the old `update-env-vars` branch and creates a fresh one. If you see an error, you can manually delete it:
```bash
git branch -D update-env-vars
git push origin --delete update-env-vars
```

### Deployment not triggered

After merging the PR, check GitHub Actions:
```
https://github.com/xl-c111/Flora/actions
```

---

## 🔒 Security Notes

1. **All values stored securely**
   - Backend: AWS SSM Parameter Store (encrypted)
   - Frontend: GitHub Secrets (encrypted)
   - Never committed to Git

2. **All values are SecureString by default**
   - Script uses `SecureString` type for all parameters
   - Encrypted at rest in AWS SSM

3. **Audit trail**
   - All SSM changes logged in CloudTrail
   - Git commits show when deployments occurred
   - PR history shows what was updated

4. **Branch protection respected**
   - Script creates PR automatically
   - Requires manual merge approval
   - Clean Git history maintained

---

## 📚 See Also

- [Full Environment Variables Guide](../terraform/docs/ENVIRONMENT_VARIABLES_GUIDE.md)
- [AWS Terraform Deployment Guide](../terraform/docs/AWS_TERRAFORM_DEPLOYMENT.md)
- Backend deployment script: `scripts/deploy-backend.sh`
- Frontend deployment script: `scripts/deploy-frontend.sh`
- Simple update script: `scripts/update-env-simple.sh` ⭐
