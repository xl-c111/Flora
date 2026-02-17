# CI/CD Deployment Flow with Encrypted GitHub Secrets

```pgsql
┌────────────────────┐
│     Developer      │
│                    │
│ git push code      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   GitHub Repo      │
│                    │
│ triggers workflow  │
└─────────┬──────────┘
          │
          ▼
┌──────────────────────────────────┐
│    GitHub Actions Runner         │
│   (temporary secure VM)          │
│                                  │
│  STEP 1: Load encrypted secrets  │
│                                  │
│  AWS_ACCESS_KEY_ID               │
│  AWS_SECRET_ACCESS_KEY           │
│  EC2_SSH_PRIVATE_KEY             │
│                                  │
│  Secrets injected securely       │
│  into environment variables      │
└─────────┬────────────────────────┘
          │
          │ uses secrets
          ▼
┌───────────────────────────────────┐
│      Authenticate with AWS        │
│                                   │
│ AWS credentials from secrets      │
│ allow secure AWS access           │
└─────────┬─────────────────────────┘
          │
          │ deploy frontend
          ▼
┌────────────────────────────────────┐
│        Upload frontend             │
│                                    │
│ GitHub Actions → S3 Bucket         │
│                                    │
│ aws s3 sync build/ s3://bucket     │
└─────────┬──────────────────────────┘
          │
          │ deploy backend
          ▼
┌───────────────────────────────────┐
│        Connect to EC2             │
│                                   │
│ Uses SSH private key from secrets │
│                                   │
│ ssh ec2-user@server               │
└─────────┬─────────────────────────┘
          │
          ▼
┌───────────────────────────────────┐
│      Deploy backend on EC2        │
│                                   │
│ git pull                          │
│ restart server                    │
│                                   │
│ backend now updated               │
└─────────┬─────────────────────────┘
          │
          ▼
┌───────────────────────────────────┐
│   GitHub Actions finishes         │
│                                   │
│ Runner destroyed automatically    │
│                                   │
│ Secrets removed from memory       │
└───────────────────────────────────┘

```
 
## How to manage secrets in CI/CD?
- In CI/CD, I store sensitive credentials in GitHub encrypted secrets. When the deployment workflow runs, GitHub securely injects these secrets into the runner, which uses them to authenticate with AWS and deploy the application to S3 and EC2. The secrets are never stored in the repository and are automatically removed after deployment.
