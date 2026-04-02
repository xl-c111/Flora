# Production Architecture – Flora System
```vbnet
                    ┌─────────────────────────┐
                    │        Users            │
                    │   (Browser / Mobile)    │
                    └────────────┬────────────┘
                                 │
                                 │ HTTPS
                                 ▼
                    ┌────────────────────────┐
                    │      CloudFront CDN    │
                    │  (Global edge cache)   │
                    └────────────┬───────────┘
                                 │
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
      ┌─────────────────────┐        ┌─────────────────────┐
      │   S3 Bucket         │        │     EC2 Instance    │
      │  (React Frontend)   │        │  (Node / Flask API) │
      │  Static hosting     │        │                     │
      └─────────────────────┘        └─────────┬───────────┘
                                               │
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │  AWS SSM Parameter  │
                                    │      Store          │
                                    │ (Secrets storage)   │
                                    └─────────┬───────────┘
                                              │
                                              │ generates
                                              ▼
                                       ┌──────────────┐
                                       │   .env file  │
                                       │ on EC2       │
                                       └──────┬───────┘
                                              │
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │    PostgreSQL DB    │
                                    │   (RDS or EC2)      │
                                    └─────────────────────┘



──────────────────────────────────────────────────────────────
                    CI/CD Deployment Pipeline
──────────────────────────────────────────────────────────────

        ┌─────────────────────┐
        │     Developer       │
        │  push code to GitHub│
        └─────────┬───────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │      GitHub Repo    │
        └─────────┬───────────┘
                  │ triggers
                  ▼
        ┌────────────────────────────┐
        │    GitHub Actions CI/CD    │
        │                            │
        │ uses encrypted secrets     │
        │ (AWS keys, SSH keys)       │
        └─────────┬──────────────────┘
                  │
        ┌─────────┴──────────────┐
        │                        │
        ▼                        ▼
┌────────────────┐      ┌─────────────────┐
│ Deploy frontend│      │ Deploy backend  │
│ to S3          │      │ to EC2          │
└────────────────┘      └─────────────────┘


```

## Production architecture of Flora
- In production, users access the frontend through CloudFront CDN, which serves static files from S3. API requests are routed to the backend running on EC2. The backend retrieves secrets securely from AWS SSM Parameter Store and connects to a PostgreSQL database. Deployment is automated through GitHub Actions CI/CD, which uses encrypted secrets to deploy the frontend to S3 and backend to EC2.
