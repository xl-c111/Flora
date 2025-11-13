# Flora AWS Deployment Flow

This note distills how the Flora stack runs in AWS today, how requests flow end‑to‑end (including Stripe CLI), and exactly what to do when you need to redeploy either side of the app.

---

## 1. Components At A Glance

| Layer | AWS / Service | Purpose | Key Notes |
| --- | --- | --- | --- |
| CDN + Static Hosting | **CloudFront** + **S3 frontend bucket** | Serves the React build over HTTPS (`https://dzmu16crq41il.cloudfront.net`) | CloudFront caches assets; `/api/*` behavior forwards to backend |
| API Compute | **EC2 t2.micro** (Terraform compute module) | Runs the Node/Express backend under PM2 | User-data script handles git clone, pnpm install, build, PM2 startup, CloudWatch agent |
| Data | **RDS PostgreSQL (db.t3.micro)** in private subnet | Prisma connects via security-group-locked endpoint | Credentials/URL injected from SSM Parameter Store |
| Secrets | **SSM Parameter Store** | Central location for Auth0, Stripe, SMTP, DB, AI keys | User-data pulls parameters during bootstrap; keep prod updates here |
| CDN Cache Invalidation | **CloudFront** | Ensures new frontend build is visible | `aws cloudfront create-invalidation --paths "/*"` after each sync |
| Payments | **Stripe API + Stripe CLI** | Processes payments + webhooks | CLI tunnel forwards events to `/api/stripe/webhook` because Stripe servers cannot reach local dev directly |
| Email | **Gmail SMTP via Nodemailer** | Order confirmations + notifications | Env vars: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` |

---

## 2. Logic Flow (Frontend → Backend → Stripe → DB)

1. **Browser hits CloudFront**  
   - Static assets (JS/CSS) served from the S3 frontend bucket.  
   - `/api/*` requests are proxied to the EC2 instance on port 3001 via CloudFront custom origin.
2. **Express backend on EC2**  
   - Handles Auth0-protected routes, order creation, subscriptions.  
   - Uses Prisma to talk to RDS PostgreSQL.  
   - Sends transactional email through Nodemailer + Gmail SMTP.
3. **Stripe payment flow**  
   - Backend calls Stripe SDK to create PaymentIntents/Subscriptions.  
   - Stripe servers emit webhook events (e.g., `payment_intent.succeeded`).  
   - In development, Stripe CLI (running locally or in the Docker compose service) forwards those events to the backend webhook handler.
4. **Webhook handler**  
   - Validates signature, updates order status, records payments, triggers email notifications, writes to Postgres.
5. **Frontend confirmation**  
   - After Stripe confirms payment, the frontend redirects to `/order-confirmation/:orderId`, which reads details from the backend (`/api/orders/:id`) and presents them to the user.

### Flowchart

```
┌───────────────────┐
│  Browser (React)  │
└─────────┬─────────┘
          │ HTTPS
          ▼
┌───────────────────┐      Static assets        ┌────────────────────────────┐
│   CloudFront CDN  │ ────────────────────────▶ │     S3 Frontend Bucket      │
└─────────┬─────────┘                          └────────────────────────────┘
          │ /api/* proxy
          ▼
┌──────────────────────────────────────────────┐
│   EC2 Backend (Node/Express + PM2)           │
│   • Uses Prisma                              │
│   • Reads secrets from SSM Parameter Store   │
│   • Calls Stripe SDK                         │
│   • Sends email via Nodemailer               │
└─────────┬───────────────┬────────────────────┘
          │               │
          │ Prisma        │ Secrets
          ▼               │
┌───────────────────┐     │
│  RDS PostgreSQL   │ ◀───┘
└───────────────────┘

Stripe flow:
    EC2 ──Create PaymentIntent──▶ Stripe API
    Stripe API ──webhook──▶ Stripe CLI tunnel (dev) / public webhook (prod) ──▶ EC2 /stripe/webhook

Email:
    EC2 ──SMTP──▶ Gmail (Nodemailer)

Response:
    EC2 ──JSON/API──▶ CloudFront ──▶ Browser
```

---

## 3. When To Redeploy

| Scenario | Redeploy Frontend? | Redeploy Backend? | Notes |
| --- | --- | --- | --- |
| UI/UX changes, React code edits, asset updates | ✅ | ❌ | Build + sync new `dist/` to S3, invalidate CloudFront |
| Auth0/Stripe/Public env var change in `apps/frontend/.env` | ✅ | ❌ | Frontend bundle must be rebuilt to bake new env vars |
| API/Express logic change, Prisma schema, npm dependency update | ❌ | ✅ | Rebuild backend, run migrations, restart PM2 |
| Shared TypeScript types or `.env` values consumed by both sides | ✅ | ✅ | Deploy backend first (API contracts), then frontend |
| Parameter Store / secret update (e.g., SMTP password) | ❌ | ✅ | Redeploy or restart backend so user-data/PM2 pick up new env |
| Stripe webhook handler change | ❌ | ✅ | Redeploy backend; also update Stripe CLI config if endpoints change |

---

## 4. Redeploying The Frontend

1. **Build locally**
   ```bash
   cd /Users/xiaolingcui/Flora
   pnpm --filter frontend build
   ```
2. **Upload to S3**
   ```bash
   BUCKET=$(cd terraform && terraform output -raw frontend_bucket_name)
   aws s3 sync apps/frontend/dist s3://$BUCKET/ \
     --delete \
     --cache-control "public,max-age=31536000,immutable" \
     --exclude "index.html"

   aws s3 cp apps/frontend/dist/index.html s3://$BUCKET/index.html \
     --cache-control "public,max-age=60"
   ```
3. **Invalidate CloudFront**
   ```bash
   DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
   aws cloudfront create-invalidation \
     --distribution-id $DIST_ID \
     --paths "/*"
   ```
4. **Smoke test**  
   Visit `https://dzmu16crq41il.cloudfront.net` in an incognito window to verify the new build, then walk through checkout to ensure `/api` calls succeed.

---

## 5. Redeploying The Backend

> The EC2 instance already knows how to build + run via the Terraform user-data script. Redeploying is essentially “pull latest, rebuild, restart PM2.”

1. **SSH into EC2**
   ```bash
   EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)
   ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP
   ```
2. **Pull latest code**
   ```bash
   cd /home/ubuntu/Flora
   git fetch origin
   git checkout main
   git pull origin main
   ```
3. **Install dependencies + build**
   ```bash
   pnpm install
   pnpm --filter backend build
   ```
4. **Apply database changes if schema changed**
   ```bash
   pnpm --filter backend db:setup    # migrate deploy + seed
   ```
5. **Restart PM2**
   ```bash
   cd apps/backend
   pm2 restart flora-backend
   pm2 logs flora-backend --lines 50
   ```
6. **Verify health**
   ```bash
   curl -f http://localhost:3001/api/health
   ```

If the instance uses SSM parameters for secrets, restarting PM2 (or re-running the user-data script via `cloud-init single --name init-user`) ensures updated secrets are sourced.

---

