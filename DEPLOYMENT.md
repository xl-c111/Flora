# Flora Deployment Quick Reference

Quick commands for deploying frontend, backend, and database changes to AWS.

For detailed explanation, see: `terraform/docs/AWS_DEPLOYMENT_FLOW.md`

---

## When To Redeploy

| What Changed | Frontend | Backend | Database |
|--------------|----------|---------|----------|
| React UI/UX changes, CSS, assets | ✅ | ❌ | ❌ |
| Frontend env vars (Auth0, Stripe public keys) | ✅ | ❌ | ❌ |
| API logic, Express routes, services | ❌ | ✅ | ❌ |
| Prisma schema changes | ❌ | ✅ | ✅ |
| Backend env vars (secrets, DB connection) | ❌ | ✅ | ❌ |
| npm/pnpm dependency updates | ✅ | ✅ | ❌ |
| Shared TypeScript types | ✅ | ✅ | ❌ |

**Rule:** Deploy backend first, then frontend (if both need updating)

---

## Deploy Frontend

```bash
# 1. Build locally
pnpm --filter frontend build

# 2. Sync to S3
BUCKET=$(cd terraform && terraform output -raw frontend_bucket_name)
aws s3 sync apps/frontend/dist s3://$BUCKET/ \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

aws s3 cp apps/frontend/dist/index.html s3://$BUCKET/index.html \
  --cache-control "public,max-age=60"

# 3. Invalidate CloudFront cache
DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"

# 4. Test
# Visit https://dzmu16crq41il.cloudfront.net in incognito mode
```

---

## Deploy Backend

```bash
# 1. Get EC2 IP and SSH in
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP

# 2. Pull latest code (adjust branch as needed)
cd /home/ubuntu/Flora
git fetch origin
git checkout main  # or xiaoling-deployment
git pull origin main

# 3. Run automated backend deploy helper (regenerates .env, Prisma client, build, and restarts PM2)
./scripts/deploy-backend.sh prod ap-southeast-2 flora-db-production.cbm26q24g3sj.ap-southeast-2.rds.amazonaws.com

# 4. Tail logs if needed
pm2 logs flora-backend --lines 50

# 5. Verify health
curl -f http://localhost:3001/api/health
```

---

## Deploy Database Changes

Run these commands **on the EC2 instance** after pulling code with Prisma schema changes:

```bash
# SSH into EC2 first
ssh -i ~/.ssh/flora-key.pem ubuntu@$(cd terraform && terraform output -raw ec2_public_ip)

cd /home/ubuntu/Flora

# Option 1: Run migrations only (production-safe)
pnpm --filter backend prisma migrate deploy

# Option 2: Run migrations + reseed (use with caution - may duplicate data)
pnpm --filter backend db:setup

# Option 3: Generate Prisma client only (if schema changed but no migration)
pnpm --filter backend prisma generate

# Then restart backend
cd apps/backend
pm2 restart flora-backend
pm2 logs flora-backend --lines 50
```

**Database Migration Best Practices:**
- Always backup production database before running migrations
- Use `prisma migrate deploy` in production (not `prisma migrate dev`)
- Test migrations in dev environment first
- `db:setup` includes seeding - only use if you want to add seed data
- After migrations, always restart the backend to load new Prisma client

---

## Troubleshooting

**Frontend not updating after deploy?**
- Check CloudFront invalidation completed: `aws cloudfront get-invalidation --distribution-id $DIST_ID --id <invalidation-id>`
- Clear browser cache or test in incognito
- Verify S3 sync completed: `aws s3 ls s3://$BUCKET/`

**Backend not starting after deploy?**
- Check PM2 logs: `pm2 logs flora-backend --lines 100`
- Check PM2 status: `pm2 status`
- Verify env vars: Check SSM Parameter Store has required secrets
- Test DB connection: `pnpm --filter backend prisma db pull`

**Database migration failed?**
- Check migration status: `pnpm --filter backend prisma migrate status`
- View Prisma logs for detailed error
- Rollback if needed (manual SQL or restore from backup)
- Ensure RDS is accessible from EC2 (security group rules)

**500 errors after deployment?**
- Check PM2 logs for error details
- Verify all environment variables are set correctly
- Check RDS connection and credentials
- Ensure Prisma client was regenerated after schema changes

---

## Quick Health Checks

```bash
# Backend API health
curl https://dzmu16crq41il.cloudfront.net/api/health

# Frontend loads
curl -I https://dzmu16crq41il.cloudfront.net

# Database connection (from EC2)
cd /home/ubuntu/Flora && pnpm --filter backend prisma db pull

# PM2 status (from EC2)
pm2 status
pm2 logs flora-backend --lines 20
```

---

## Emergency Rollback

**Frontend rollback:**
```bash
# Restore previous S3 version or rebuild from previous commit
git checkout <previous-commit>
pnpm --filter frontend build
# Run S3 sync + CloudFront invalidation again
```

**Backend rollback:**
```bash
# On EC2
cd /home/ubuntu/Flora
git checkout <previous-commit>
pnpm install
pnpm --filter backend build
cd apps/backend
pm2 restart flora-backend
```

**Database rollback:**
- Restore from RDS snapshot (AWS Console → RDS → Snapshots)
- Or manually write reverse migration SQL

---

For more details, architecture diagrams, and Stripe webhook setup, see `terraform/docs/AWS_DEPLOYMENT_FLOW.md`
