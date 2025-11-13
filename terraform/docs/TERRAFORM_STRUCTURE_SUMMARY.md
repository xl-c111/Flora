# Terraform Structure Summary

This guide explains what each item under `terraform/` does and highlights the key scripts you rely on during deployment.

---

## Top-Level Files

| File | Purpose |
| ---- | ------- |
| `backend.tf` | Points Terraform state to an S3 bucket + DynamoDB lock table so multiple people can work safely. |
| `versions.tf` | Pins Terraform core/provider versions to ensure reproducible runs. |
| `variables.tf` | Declares shared inputs (project name, environment, region, etc.). |
| `main.tf` | Orchestrates all modules—wires networking, IAM, compute, database, storage, CDN, monitoring together. |
| `outputs.tf` | Surfaces useful IDs such as S3 bucket name, CloudFront distribution ID, EC2 public IP. |
| `tfplan` | Cached plan artifact (zip). Helpful for review but not hand-edited. |
| `docs/` | Runbooks and interview notes (deployment flow, Stripe summary, Q&A). |

---

## Environments

- `environments/dev/main.tf`  
- `environments/prod/main.tf`  

These optional entry points show how to pass different variables per environment (instance sizes, CIDR blocks, feature toggles). They call the root module with `environment = "dev"` or `"prod"`.

---

## Module Breakdown

Each folder in `terraform/modules/` contains its own `main.tf`, `variables.tf`, `outputs.tf`.

1. **`state-backend/`** – Creates the S3 bucket + DynamoDB table used by `backend.tf`. Run once before other modules.
2. **`networking/`** – VPC, subnets, route tables, internet gateway, and security groups (exposes only the ports EC2/RDS need).
3. **`iam/`** – IAM roles, policies, and instance profile that grant EC2 access to SSM, CloudWatch, S3, etc.
4. **`compute/`** – Launches the EC2 instance, Elastic IP, and attaches IAM role.
   - **Key script:** `compute/user-data.sh`
     - Installs Node 18, pnpm, PM2.
     - Clones the Flora repo, installs dependencies, builds backend, runs Prisma migrations.
     - Pulls secrets from SSM Parameter Store into `apps/backend/.env`.
     - Starts the app with PM2 and configures CloudWatch log shipping.
5. **`database/`** – RDS PostgreSQL instance in private subnets, subnet group, parameter group, security-group rules restricting access to EC2.
6. **`storage/`** – S3 bucket for the React build (versioning, encryption, public-access block, bucket policy for CloudFront OAI, optional CORS).
7. **`cdn/`** – CloudFront distribution with two origins (S3 for static assets, EC2 for `/api/*`), SPA-friendly error responses, HTTPS enforcement, cache behaviors. CloudFront now forwards API traffic to the EC2 origin on port `3001` to match the Express server.
8. **`monitoring/`** – CloudWatch log groups/alarms/dashboards that watch EC2 metrics and PM2 logs.

---

## Key Operational Scripts / Notes

- **`modules/compute/user-data.sh`** – Automated backend deployment script invoked at EC2 boot. It’s the reason you rarely need to SSH manually.
- **Docs runbooks** (`AWS_DEPLOYMENT_FLOW.md`, `STRIPE_DEPLOYMENT_SUMMARY.md`, `AWS_INTERVIEW_QA.md`) – Provide the exact `aws s3 sync`, CloudFront invalidation, Stripe CLI, and troubleshooting steps.

Keep this summary handy when onboarding teammates or explaining how Terraform is laid out during interviews. Update it whenever you add new modules or scripts.
