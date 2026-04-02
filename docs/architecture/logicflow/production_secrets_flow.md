# Production Secrets Usage Logic Flow
```sql
┌──────────────────────────────────────┐
│        Secrets Storage Layer         │
│                                      │
│  AWS SSM Parameter Store             │
│                                      │
│  Secrets stored securely:            │
│                                      │
│  /prod/DATABASE_URL                  │
│  /prod/JWT_SECRET                    │
│  /prod/STRIPE_SECRET_KEY             │
│                                      │
│  ✔ encrypted at rest                 │
│  ✔ access controlled by IAM role     │
└───────────────────┬──────────────────┘
                    │
                    │ secure retrieval request
                    ▼
┌──────────────────────────────────────┐
│         EC2 Instance starts          │
│                                      │
│  Backend server starting             │
│                                      │
│  Has IAM Role permission:            │
│  ssm:GetParameter                    │
└───────────────────┬──────────────────┘
                    │
                    │ retrieves secrets securely
                    ▼
┌──────────────────────────────────────┐
│        Retrieve Secrets from SSM     │
│                                      │
│  Example request:                    │
│                                      │
│  aws ssm get-parameter               │
│   --name "/prod/DATABASE_URL"        │
│   --with-decryption                  │
└───────────────────┬──────────────────┘
                    │
                    │ inject secrets into runtime
                    ▼
┌──────────────────────────────────────┐
│        Environment Variables         │
│                                      │
│  Secrets loaded into memory:         │
│                                      │
│  DATABASE_URL=postgresql://...       │
│  JWT_SECRET=xxxx                     │
│                                      │
│  or written into .env file           │
└───────────────────┬──────────────────┘
                    │
                    │ application reads secrets
                    ▼
┌──────────────────────────────────────┐
│         Application Runtime          │
│                                      │
│  Backend application starts          │
│                                      │
│  Reads secrets via:                  │
│                                      │
│  process.env.DATABASE_URL            │
│                                      │
│  Uses secrets to:                    │
│                                      │
│  connect to database                 │
│  authenticate users                  │ 
│  call external APIs                  │
└───────────────────┬──────────────────┘
                    │
                    │ secrets remain in memory only
                    ▼
┌──────────────────────────────────────┐
│           Runtime Lifecycle          │
│                                      │
│  Secrets remain:                     │
│                                      │
│  ✔ in memory during runtime          │
│  ✔ not stored in source code         │
│                                      │
│  Secrets removed when:               │
│                                      │
│  server stops                        │
│  instance terminated                 │
└──────────────────────────────────────┘

```
## Flora example
```csharp
Developer laptop
     ↓
push code
     ↓
GitHub
     ↓
Deployment (CI/CD)
     ↓
EC2 instance starts deployment
     ↓
EC2 requests secrets from AWS SSM Parameter Store
     ↓
SSM securely sends secrets
     ↓
Deployment script generates .env file on EC2
     ↓
Application starts using environment variables

```
## How to manage secrets in production?
- In production, secrets are stored securely in AWS SSM Parameter Store. When the EC2 instance starts, it retrieves the secrets using its IAM role and injects them as environment variables. The application then reads these environment variables to connect to services such as the database or external APIs. This ensures secrets are never stored in the source code and remain secure.
