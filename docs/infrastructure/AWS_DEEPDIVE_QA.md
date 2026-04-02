# Flora AWS Architecture — Deep Dive (Q&A)

Audience: graduate software engineer interviews.  
Style: short answer first, then a 60–120s deep dive using **What / How (in Flora) / Trade-off / Next**.

---

## 0) One-sentence architecture

Flora is a React SPA served from **S3 + CloudFront**, with **CloudFront forwarding `/api/*` to an EC2-hosted Express API (PM2)**, and **Postgres running in Docker on the same EC2 instance**, with secrets stored in **AWS SSM Parameter Store** and infra defined via **Terraform**.

---

# 1) System overview

### Q: Draw the AWS architecture in 10 seconds.
**A:** Browser → CloudFront → (S3 for static) OR (`/api/*` → EC2:3001 for API) → Postgres (Docker) via Prisma.

**Extended:**
- **What:** A “CDN + static hosting + single API server” architecture.
- **How (in Flora):** CloudFront is the single public entry point (HTTPS). Default behavior serves the SPA from S3. An ordered behavior routes `/api/*` to an EC2 origin on port 3001.
- **Trade-off:** Very simple and cheap to run, but a single EC2 box is both a scaling limit and a single point of failure.
- **Next:** Put the API behind an ALB + multiple instances (ASG/ECS), and move DB to RDS/Aurora for reliability.

### Q: Why is CloudFront in front of the API at all?
**A:** One domain, HTTPS everywhere, simple routing (`/api/*` → backend), and CDN benefits for the frontend.

**Extended:**
- **What:** CloudFront is acting as both CDN and reverse proxy.
- **How (in Flora):** Static files are cached globally; API traffic is not cached (TTL = 0) but benefits from one consistent origin and TLS termination.
- **Trade-off:** It’s not the “standard” enterprise pattern (often API uses ALB/API Gateway). Debugging and origin security need extra care.
- **Next:** For production scale, keep CloudFront for the SPA and put API behind ALB (optionally still fronted by CloudFront if needed).

### Q: What are the biggest single points of failure (SPOFs) today?
**A:** One EC2 instance, and DB + API share the same box.

**Extended:**
- **What:** Single-node architecture means one failure can take everything down.
- **How (in Flora):** EC2 runs both the Express app and Postgres (Docker). If EC2 dies or disk fills, the system is down.
- **Trade-off:** Great for a student project and fast iteration; not acceptable for a real uptime target.
- **Next:** Separate tiers: API horizontally scalable; DB managed with backups and automated recovery.

---

# 2) CloudFront (routing, caching, headers)

### Q: How does CloudFront route frontend vs backend traffic?
**A:** Default behavior → S3. Ordered behavior for `/api/*` → EC2 origin.

**Extended:**
- **What:** CloudFront behaviors decide which origin handles a request.
- **How (in Flora):** `default_cache_behavior` targets S3. `ordered_cache_behavior` with `path_pattern = "/api/*"` targets the EC2 origin.
- **Trade-off:** Simple and readable, but if you add new paths (like `/webhooks/*`) you must ensure they match the behavior you expect.
- **Next:** Add explicit behaviors for sensitive endpoints if needed (e.g., tighter header forwarding for webhooks).

### Q: What is your caching strategy for static assets vs API?
**A:** Static assets are cached; API is not cached (TTL = 0).

**Extended:**
- **What:** Cache static, don’t cache dynamic API responses by default.
- **How (in Flora):** CloudFront API behavior sets `default_ttl/max_ttl = 0`. Static behavior caches and compresses responses. On deploy we also upload `index.html` with a short cache so new builds propagate quickly.
- **Trade-off:** No API caching keeps correctness simple but can increase backend load.
- **Next:** Add safe caching for truly read-only endpoints (product list) using Cache-Control and/or a backend cache (Redis).

### Q: Which headers/cookies/query params do you forward to the API and why?
**A:** Forward auth-related headers and query strings; cookies are forwarded because the behavior is “dynamic”, but caching is disabled anyway.

**Extended:**
- **What:** Forwarding affects both correctness and cache hit ratio.
- **How (in Flora):** The `/api/*` behavior forwards query strings and key headers like `Authorization`, `Origin`, `Accept`, `Content-Type` and forwards cookies. Since TTL is 0, forwarding cookies doesn’t hurt cache hit ratio, but it increases request size.
- **Trade-off:** Over-forwarding can increase latency and complexity; under-forwarding can break auth/CORS.
- **Next:** Tighten forwarding to only what the API truly needs (often no cookies), and use modern cache policies (instead of legacy forwarded_values).

### Q: How do you support SPA routing (deep links like `/products/123`)?
**A:** CloudFront maps 403/404 to `/index.html` with a 200 so the SPA can handle the route.

**Extended:**
- **What:** SPA routing needs the CDN to serve `index.html` for unknown paths.
- **How (in Flora):** CloudFront `custom_error_response` returns `index.html` for 403/404.
- **Trade-off:** This can hide real 404s for static assets if misconfigured; you need good monitoring and correct asset caching.
- **Next:** Keep strict caching for hashed assets and short caching for `index.html` to reduce “stale app shell” issues.

### Q: How do you invalidate CloudFront after deployment, and why?
**A:** Invalidate (at least) `index.html` so users get the new build right away.

**Extended:**
- **What:** CloudFront caches, so updates may not be visible immediately.
- **How (in Flora):** The deploy script/workflow performs CloudFront invalidation after syncing to S3; `index.html` is the key because it references new hashed JS/CSS.
- **Trade-off:** Invalidation costs money at scale and adds time to deploy.
- **Next:** Prefer long cache for hashed assets + short cache for `index.html` so you only invalidate the minimum.

---

# 3) S3 (static hosting)

### Q: What exactly is stored in S3?
**A:** The built frontend output (`apps/frontend/dist`) — static JS/CSS/images and `index.html`.

**Extended:**
- **What:** S3 is static hosting, not a server.
- **How (in Flora):** Vite builds to `dist/`, then we sync to the S3 bucket. CloudFront pulls from S3 as the origin.
- **Trade-off:** Great performance and low ops, but it’s build-time deployment (you can’t “hot change” frontend env vars without rebuild).
- **Next:** Add versioned builds or bucket versioning + rollbacks for faster recovery.

### Q: How do you keep the S3 bucket private while still serving through CloudFront?
**A:** Use a CloudFront Origin Access Identity (OAI) + bucket policy so only CloudFront can read.

**Extended:**
- **What:** Prevent direct public reads from S3.
- **How (in Flora):** Terraform creates an OAI and the storage module sets a bucket policy that allows that identity to read objects.
- **Trade-off:** Slightly more config, but avoids exposing your bucket directly to the internet.
- **Next:** Migrate to Origin Access Control (OAC) for newer CloudFront setups if you want the modern pattern.

---

# 4) EC2 + PM2 (compute)

### Q: Why EC2 instead of serverless (Lambda) or containers (ECS)?
**A:** EC2 is the simplest “always-on server” for a full-stack student project and works well with long-lived processes like Express + PM2.

**Extended:**
- **What:** EC2 gives you full control over a VM.
- **How (in Flora):** We run Express on port 3001 and PM2 keeps it alive/restarts on crash.
- **Trade-off:** You manage patching, scaling, and deployments yourself.
- **Next:** For production scale, move to ECS/Fargate (or ASG) for easier horizontal scaling and safer deploys.

### Q: How do you deploy backend changes to EC2?
**A:** GitHub Actions SSHes into EC2, pulls the latest code, regenerates `.env` from SSM, runs migrations, builds, and restarts PM2.

**Extended:**
- **What:** Automated “pull, build, restart” deployment.
- **How (in Flora):** The deploy workflow connects via SSH and runs steps: git reset → fetch secrets from SSM into `apps/backend/.env` → ensure Postgres container is running → Prisma generate + `migrate deploy` → `pnpm --filter backend build` → `pm2 restart`.
- **Trade-off:** Restarting a single process can cause brief downtime and there’s no canary/rolling deploy.
- **Next:** Put the API behind a load balancer and do rolling updates across multiple instances.

### Q: How do you ensure the backend gets the real client IP (for rate limiting/logs) behind CloudFront?
**A:** Express sets `trust proxy` so it uses `X-Forwarded-For`.

**Extended:**
- **What:** Proxies hide the real client IP unless you configure trust.
- **How (in Flora):** With `trust proxy`, `req.ip` reflects the forwarded client IP so rate limiting and logs work correctly.
- **Trade-off:** You should only trust proxy headers from trusted proxies.
- **Next:** If you add an ALB/WAF, define a clear trusted proxy chain.

---

# 5) Database on EC2 (Postgres in Docker)

### Q: Why run Postgres in Docker on EC2?
**A:** It’s simple, consistent with local dev, and avoids the complexity/cost of managed DB for a student project.

**Extended:**
- **What:** Self-hosted DB inside a container.
- **How (in Flora):** Postgres runs as a Docker container with a persistent volume, and Prisma connects via `localhost:5432`.
- **Trade-off:** You lose RDS benefits: automated backups, easy scaling, built-in HA.
- **Next:** Move DB to RDS/Aurora if you need reliability and scaling, and keep EC2 for stateless compute.

### Q: How do you handle backups and disaster recovery with self-hosted Postgres?
**A:** Scheduled `pg_dump` + store dumps in S3; test restores periodically.

**Extended:**
- **What:** Backups are now your responsibility.
- **How (in Flora):** Run `pg_dump` inside the container, copy the dump to a safe place (S3), keep retention, and practice restore.
- **Trade-off:** Easy to say, easy to forget; untested backups are not real backups.
- **Next:** Automate backups + encryption + restore drills, or move to RDS for managed backups.

---

# 6) Secrets & IAM (SSM Parameter Store)

### Q: How are production secrets managed?
**A:** In AWS SSM Parameter Store under `/flora/prod/*`, pulled during deployment to generate `apps/backend/.env`.

**Extended:**
- **What:** Central secret store (not in git).
- **How (in Flora):** Secrets like Stripe keys, Auth0 values, SMTP, DB password live in SSM. Deployment pulls them and writes `.env` on EC2.
- **Trade-off:** Missing/misnamed params break production at runtime; you need checks and runbooks.
- **Next:** Add startup validation (fail fast if required vars missing) and consider reducing SSH usage by using SSM Session Manager.

### Q: What IAM permissions does EC2 need?
**A:** Least-privilege permissions to read specific SSM parameters and write logs/metrics to CloudWatch.

**Extended:**
- **What:** IAM role controls what EC2 can do.
- **How (in Flora):** EC2 has an instance profile that allows reading from SSM and publishing logs via the CloudWatch agent.
- **Trade-off:** Too-broad IAM policies are a security risk; too-tight policies cause deploy failures.
- **Next:** Scope policies to `/flora/prod/*` paths only and audit permissions regularly.

---

# 7) Terraform (IaC, state, drift)

### Q: What does Terraform manage in your AWS setup?
**A:** VPC/subnets/IGW/route tables, security groups, EC2 + EIP, S3 buckets, CloudFront distribution, IAM roles/policies.

**Extended:**
- **What:** Infrastructure as code for reproducibility.
- **How (in Flora):** Modules separate networking/iam/compute/storage/cdn. Outputs provide bucket name, distribution id, EC2 IP, etc.
- **Trade-off:** Terraform adds a learning curve and you must manage state safely.
- **Next:** Add clear environment separation (dev/prod), and run `terraform plan` in CI to catch drift.

### Q: How do you manage Terraform remote state and prevent concurrent applies?
**A:** Store state in S3 and use DynamoDB for state locking.

**Extended:**
- **What:** Remote state avoids “state file on my laptop” problems.
- **How (in Flora):** Terraform backend points to S3; DynamoDB lock prevents two applies at once.
- **Trade-off:** You must bootstrap the backend (state bucket + lock table) once.
- **Next:** Add IAM guardrails so only CI/admin can apply in prod.

### Q: What would you say about security groups in this project?
**A:** They’re currently permissive for a demo (SSH/API open to 0.0.0.0/0), and the production improvement is to restrict them.

**Extended:**
- **What:** SGs are the firewall for instances.
- **How (in Flora):** EC2 SG allows SSH and API port access broadly. This works for quick access but isn’t ideal.
- **Trade-off:** Convenience vs security.
- **Next:** Restrict SSH to your IP or use SSM Session Manager; restrict API origin access to CloudFront/ALB, and remove unused ports.

---

# 8) Observability (CloudWatch)

### Q: What logging/monitoring exists today?
**A:** PM2 logs are shipped to CloudWatch via the CloudWatch agent; there’s also a health endpoint (`/api/health`) behind CloudFront.

**Extended:**
- **What:** Basic logs + health checks.
- **How (in Flora):** CloudWatch agent tails PM2 output logs and user-data logs. Health endpoint verifies the API is alive.
- **Trade-off:** Logs help debugging, but without metrics/alerts you find out problems late.
- **Next:** Add alarms on 5xx rate, p95 latency, disk space, and webhook failure rate; add dashboards.

---

# 9) Scaling & reliability questions (senior-level)

### Q: If traffic grows 10x, what’s your AWS scaling plan?
**A:** Add an ALB + multiple API instances (ASG/ECS), move DB to RDS/Aurora, add Redis for caching/queues.

**Extended:**
- **What:** Scale stateless compute horizontally; scale DB with managed services.
- **How (in Flora):** Today EC2 is the bottleneck. The correct path is: ALB + ASG for API, DB to RDS, Redis for caching and async jobs.
- **Trade-off:** More cost and more moving parts, but the system becomes resilient and deployable without downtime.
- **Next:** First step: ALB + two instances + health checks; second step: DB to RDS and introduce a queue for emails.

### Q: How would you do zero-downtime deployments on AWS?
**A:** Run at least 2 backend instances behind a load balancer and do rolling deploys; keep DB migrations backward compatible.

**Extended:**
- **What:** Zero downtime needs redundancy + safe migrations.
- **How (in Flora):** With one instance, restart causes downtime. With ALB+ASG you can replace instances gradually while health checks protect users. DB migrations follow expand → backfill → contract.
- **Trade-off:** More infrastructure and careful release discipline.
- **Next:** Introduce staging + smoke tests, then rolling deploys in prod.

### Q: What’s one AWS architecture weakness you would fix first?
**A:** The single-instance backend (and DB on the same box). Next would be tightening security group rules.

**Extended:**
- **What:** Biggest risk is availability and recovery, not “feature code”.
- **How (in Flora):** If EC2 fails, everything fails. SGs are also open for demo convenience.
- **Trade-off:** The current setup optimizes for learning and speed.
- **Next:** Move DB to managed, add load balancer + multiple API instances, and lock down network access.

