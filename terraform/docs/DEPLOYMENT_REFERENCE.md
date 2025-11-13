# Deployment Reference

This document centralizes the exact commands needed to redeploy both the frontend (S3 + CloudFront) and backend (EC2 + PM2) portions of Flora.

---

## When to Redeploy

| Change | Redeploy Frontend? | Redeploy Backend? |
|--------|--------------------|-------------------|
| UI/UX (React/CSS/assets) | ✅ | ❌ |
| API logic / services | ❌ | ✅ |
| Prisma schema | ❌ | ✅ + `pnpm --filter backend prisma migrate deploy` |
| Environment variables | depends | depends |

---

## Frontend (S3 + CloudFront)

Run these commands on your **local machine** whenever React code, CSS, or static assets change.

```bash
pnpm --filter frontend build

BUCKET=$(cd terraform && terraform output -raw frontend_bucket_name)
aws s3 sync apps/frontend/dist s3://$BUCKET/ --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

aws s3 cp apps/frontend/dist/index.html s3://$BUCKET/index.html \
  --cache-control "public,max-age=60"

# Optional: refresh CloudFront cache immediately
DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/index.html"
```

**Run when:** any frontend asset changes. If only `index.html` changes, you may upload just that file, but the commands above are safe defaults.

---

## Backend (EC2 + PM2)

Execute these steps **on the EC2 server** whenever backend code or environment variables change.

```bash
ssh -i ~/.ssh/flora-key.pem ubuntu@15.134.175.113

cd /home/ubuntu/Flora
git pull --rebase origin xiaoling-deployment

./scripts/deploy-backend.sh \
  prod \
  ap-southeast-2 \
  flora-db-production.cbm26q24g3sj.ap-southeast-2.rds.amazonaws.com
```

The helper script:
1. Regenerates `apps/backend/.env` from SSM (SMTP/Auth0/Stripe/etc.).
2. Runs `pnpm --filter backend db:generate` and `pnpm --filter backend build`.
3. Restarts PM2 (`flora-backend`) with the updated environment.

**Schema changes:** run `pnpm --filter backend prisma migrate deploy` on EC2 before executing the script.

---

## Database Maintenance

```bash
# Apply pending migrations (safe in production)
pnpm --filter backend prisma migrate deploy

# Reseed sample data (dev/staging only)
pnpm --filter backend db:seed
```

---

## Email Assets & SMTP

`deploy-backend.sh` populates `EMAIL_IMAGE_BASE_URL`, `EMAIL_LOGO_URL`, and the SMTP credentials into `.env`. If you change logos or rotate the Gmail App Password, rerun the backend script so the mailer picks up the updates.

---

## Frontend Deploy Helper (Optional)

Run the script below from the repo root to bundle, upload, and invalidate CloudFront in one step:

```bash
./scripts/deploy-frontend.sh
```

(See `scripts/deploy-frontend.sh` for the exact commands and required AWS CLI env.)
