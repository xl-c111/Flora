# AWS Deployment – Beginner-Friendly Q&A

Use these questions to explain the Flora AWS deployment in plain English during interviews. They mix high-level concepts with specifics from this project.

---

### Q1. What is the overall architecture you deployed on AWS?
**A:** A React frontend is built locally and hosted in S3 behind CloudFront. An Express/Node backend runs on a single EC2 instance, talks to a managed PostgreSQL database in RDS, and stores files/secrets in S3 + SSM Parameter Store. CloudFront sends `/api/*` traffic to the EC2 origin, so users only ever hit the CDN domain.

### Q2. Why did you choose S3 + CloudFront for the frontend?
**A:** S3 is cheap, durable storage for static files, and CloudFront puts them behind HTTPS with caching and global edge points. It also lets me route `https://domain/api` calls back to the backend without exposing multiple domains.

### Q3. How does the backend get deployed?
**A:** Terraform’s compute module creates an Ubuntu EC2 instance with a user-data script. That script installs Node 18, pnpm, clones the repo, pulls secrets from SSM Parameter Store, builds the backend, runs Prisma migrations, and starts the app under PM2. No manual SSH steps are required after `terraform apply`.

### Q4. How do you redeploy the backend when the code changes?
**A:** SSH to the EC2 instance, pull the latest git commit, run `pnpm install`, `pnpm --filter backend build`, run migrations (`pnpm --filter backend db:setup`), then `pm2 restart flora-backend`. If secrets changed, I also refresh the `.env` generated from SSM or rerun the user-data script.

### Q5. When do you *need* to redeploy the backend?
**A:** Any Express API change, Prisma schema update, dependency upgrade, or change to secrets the backend uses (Auth0, Stripe, SMTP, DB). Also when webhook handlers, order logic, or email templates change.

### Q6. How do you redeploy the frontend?
**A:** Build locally with `pnpm --filter frontend build`, sync `apps/frontend/dist` to the S3 bucket (`aws s3 sync …`), upload `index.html` separately with a short cache-control, then invalidate CloudFront (`aws cloudfront create-invalidation --paths "/*"`).

### Q7. When does the frontend need redeploying?
**A:** Whenever the React code, CSS, assets, or frontend `.env` values (Auth0 domain, API URL, Stripe publishable key) change. Any change baked into the bundle requires a rebuild + S3 sync.

### Q8. How are secrets handled?
**A:** Terraform provisioned SSM Parameter Store entries for all production secrets (DB creds, Auth0 keys, Stripe keys, SMTP, AI, JWT). The EC2 user-data script reads them at boot and writes the backend `.env`. This avoids hard-coding secrets in AMIs or git.

### Q9. How does the backend talk to the database securely?
**A:** The RDS instance lives in a private subnet. Security groups only allow traffic from the EC2 security group on port 5432. Prisma uses the `DATABASE_URL` built from SSM parameters plus the RDS endpoint. There’s no public exposure of the database.

### Q10. How are payments processed end-to-end?
**A:** The frontend calls backend order endpoints. The backend creates a Stripe PaymentIntent using the Stripe SDK and stores the order as `PENDING`. Stripe handles the card UI (via Stripe Elements on the frontend) and generates webhook events when the payment succeeds. In dev we use Stripe CLI to forward events to `/api/stripe/webhook`; in prod Stripe calls the public webhook endpoint through Route 53/CloudFront → EC2. The webhook updates the order status to `CONFIRMED`, records payment info, and triggers confirmation email.

### Q11. Why do you use Stripe CLI during development?
**A:** Stripe’s servers can’t reach localhost directly. The CLI runs a secure tunnel: Stripe → CLI → local backend. That lets me test webhooks (payment success, failure, subscription events) before deploying.

### Q12. How do you monitor the backend?
**A:** PM2 manages the Node process and logs. The user-data script installs the CloudWatch Agent and ships PM2 logs (`flora-backend-out.log`, `user-data.log`) to `/aws/ec2/flora-backend`. I can tail logs in CloudWatch, set alarms on CPU via CloudWatch metrics, and SSH to view PM2 status if needed.

### Q13. What are the main trade-offs of this architecture?
**A:** It’s simple and Free-Tier friendly but not highly available. Single EC2 + single-AZ RDS means a single point of failure, no auto-scaling, and limited throughput. There’s also no separate staging environment yet. Those trade-offs were acceptable for a learning-focused budget project.

### Q14. How would you improve it for production?
**A:** Add an ALB + Auto Scaling Group for the backend, multi-AZ RDS, Secrets Manager with rotation, WAF in front of CloudFront, CI/CD pipelines (CodePipeline or GitHub Actions) for automated deploys, and maybe replace EC2 with ECS/Fargate or Lambda to simplify ops.

### Q15. How do you ensure the frontend and backend stay in sync?
**A:** Deploy backend changes first (especially if contract/schema changes) so new APIs exist before the frontend calls them. After verifying backend health, redeploy the frontend. For shared types or env vars, I double-check both builds and run end-to-end tests (checkout flow) before and after CloudFront invalidation.

### Q16. How do you validate a deployment succeeded?
**A:** Checklist: hit `https://dzmu16crq41il.cloudfront.net` fresh, run `curl https://<cdn>/api/health`, place a test order using Stripe test cards, confirm the webhook updates the order, verify email delivered, and check Order History populates. I also watch PM2 + CloudWatch logs during the rollout.

### Q17. What happens if Stripe webhooks fail?
**A:** Orders would stay `PENDING`, so Order History wouldn’t show them. To debug, I inspect the Stripe CLI/Stripe dashboard logs, ensure the webhook secret matches, and replay events. I also added a manual endpoint to confirm orders if needed, but the long-term fix is making sure the webhook handler is reachable and idempotent.

### Q18. How do you handle configuration differences between dev and prod?
**A:** Each environment has its own `.env` or SSM parameters. The frontend uses Vite env variables (e.g., `VITE_API_URL`) that change per deployment. Terraform modules parameterize project name + environment to create separate S3 buckets, CloudFront distributions, and RDS instances if needed.

### Q19. What’s your rollback plan?
**A:** For the frontend, S3 versioning is enabled—so I can promote a previous object version or resync the prior `dist` folder. For the backend, PM2 keeps the previous build on disk; I can `git checkout <previous_commit>`, rebuild, and restart. Database migrations run via `prisma migrate deploy`, so I keep them reversible or have backups before applying destructive changes.

### Q20. How did Terraform help?
**A:** Terraform codifies the VPC, subnets, security groups, IAM roles, EC2, RDS, S3, CloudFront, and SSM parameters. It ensures consistent environments, tracks state in an S3 backend with DynamoDB locking, and makes redeployments repeatable. I can also output bucket IDs and CloudFront IDs directly from Terraform, which streamlines the redeploy commands.

---

Use these questions to steer the conversation toward what you built, why you made each choice, and how you operate the system. Update this list whenever the architecture changes or you add new AWS services.

