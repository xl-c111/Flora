# Compute Module Guide

This guide explains how to use the compute module for automated Flora backend deployment.

## Features

- **Zero-Touch Deployment**: User-data script handles complete backend setup
- **Automated Configuration**: Pulls secrets from SSM Parameter Store
- **CloudWatch Integration**: Automatic log shipping for monitoring
- **Elastic IP**: Static public IP that persists across instance replacements
- **Security Hardened**: IMDSv2 enforced, encrypted root volume
- **PM2 Process Management**: Automatic restart on failure

## What the User-Data Script Does

1. Updates system and installs dependencies (Node.js 18, pnpm, PM2, git)
2. Clones the Flora repository from GitHub
3. Installs project dependencies with pnpm
4. Builds the backend application
5. Generates `.env` file from SSM Parameter Store secrets
6. Runs database migrations and seeds
7. Starts the application with PM2
8. Configures CloudWatch Logs agent
9. Sets up PM2 to auto-start on boot

## Prerequisites

Before using this module, ensure:

1. **SSM Parameters are set up**: All 18 Flora parameters must exist in SSM Parameter Store:
   - `/flora/prod/db_username`
   - `/flora/prod/db_password`
   - `/flora/prod/auth0_domain`
   - `/flora/prod/auth0_client_id`
   - `/flora/prod/auth0_client_secret`
   - `/flora/prod/auth0_audience`
   - `/flora/prod/stripe_secret_key`
   - `/flora/prod/stripe_publishable_key`
   - `/flora/prod/stripe_webhook_secret`
   - `/flora/prod/stripe_weekly_price_id`
   - `/flora/prod/stripe_biweekly_price_id`
   - `/flora/prod/stripe_monthly_price_id`
   - `/flora/prod/stripe_spontaneous_price_id`
   - `/flora/prod/gmail_user`
   - `/flora/prod/gmail_password`
   - `/flora/prod/gemini_api_key`
   - `/flora/prod/jwt_secret`
   - `/flora/prod/github_token` (optional, for private repos)

2. **IAM Instance Profile**: EC2 needs permissions to:
   - Read SSM parameters (`ssm:GetParameter`)
   - Write CloudWatch logs (`logs:CreateLogStream`, `logs:PutLogEvents`)

3. **SSH Key Pair**: Key pair must exist in AWS for emergency access

4. **RDS Database**: Database must be accessible from EC2 security group

## Usage

```hcl
module "compute" {
  source = "./modules/compute"

  project_name         = "flora"
  environment          = "production"
  instance_type        = "t2.micro"  # Free Tier eligible
  key_pair_name        = "flora-key"

  vpc_id               = module.networking.vpc_id
  subnet_id            = module.networking.public_subnet_id
  security_group_ids   = [module.networking.backend_security_group_id]

  instance_profile_name = module.iam.instance_profile_name
  rds_endpoint          = module.database.db_endpoint_hostname

  aws_region           = "ap-southeast-2"
}
```

## Outputs

- `instance_id`: EC2 instance ID for monitoring
- `instance_public_ip`: Static public IP from Elastic IP
- `instance_private_ip`: Private IP for VPC communication
- `backend_url`: Full backend API URL (http://IP:3001)
- `ssh_command`: Ready-to-use SSH command for debugging

## Deployment Timeline

After `terraform apply`:
- **0-2 min**: EC2 instance boots
- **2-5 min**: User-data installs dependencies
- **5-8 min**: Clones repo and builds backend
- **8-10 min**: Runs migrations and starts PM2
- **10-12 min**: Backend API is fully operational

## Monitoring

### Check Deployment Status

```bash
# Get EC2 IP
EC2_IP=$(terraform output -raw instance_public_ip)

# SSH into instance
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP

# View user-data log
tail -f /var/log/user-data.log

# Check PM2 status
pm2 status

# View application logs
pm2 logs flora-backend
```

### CloudWatch Logs

Logs are automatically shipped to CloudWatch:
- Log Group: `/aws/ec2/flora-backend`
- Streams:
  - `{instance_id}/application`: PM2 application logs
  - `{instance_id}/user-data`: Deployment script logs

```bash
# View logs from CLI
aws logs tail /aws/ec2/flora-backend --follow
```

## Troubleshooting

### User-Data Script Failed

```bash
# SSH into instance
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP

# Check user-data log for errors
cat /var/log/user-data.log

# Common issues:
# 1. SSM parameters missing or wrong region
# 2. IAM permissions insufficient
# 3. RDS endpoint unreachable
# 4. GitHub repository not accessible
```

### Backend Not Starting

```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs flora-backend --err

# Restart manually
pm2 restart flora-backend

# Check .env file was created correctly
cat /home/ubuntu/Flora/apps/backend/.env
```

### Database Connection Issues

```bash
# Test RDS connectivity
nc -zv <RDS_ENDPOINT> 5432

# Check security group rules
# Ensure RDS security group allows traffic from EC2 security group

# Verify DATABASE_URL format
grep DATABASE_URL /home/ubuntu/Flora/apps/backend/.env
```

## Security Notes

- **IMDSv2 Enforced**: Prevents SSRF attacks on metadata endpoint
- **Encrypted Root Volume**: EBS encryption at rest
- **No Hardcoded Secrets**: All secrets from SSM Parameter Store
- **Least Privilege IAM**: Instance profile only has necessary permissions

## Cost

**Free Tier eligible components:**
- EC2 t2.micro: 750 hours/month (12 months)
- Elastic IP: Free when attached to running instance
- EBS gp3 20GB: Covered under Free Tier
- CloudWatch Logs: 5GB ingestion/storage free

**Important**: Elastic IP costs $0.005/hour (~$3.60/month) if NOT attached to a running instance!

## Production Improvements

For production deployments, consider:
1. **Auto Scaling Group**: Replace single instance with ASG
2. **Application Load Balancer**: Distribute traffic across multiple instances
3. **Multi-AZ**: Deploy instances in multiple availability zones
4. **Blue-Green Deployment**: Use launch templates for zero-downtime updates
5. **Enhanced Monitoring**: Add custom CloudWatch metrics
6. **Systems Manager Session Manager**: Replace SSH with SSM sessions

## Maintenance

### Update Application Code

```bash
# SSH into instance
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP

# Update code
cd /home/ubuntu/Flora
git pull
pnpm install
pnpm --filter backend build

# Run migrations if needed
cd apps/backend
pnpm db:migrate

# Restart with zero downtime
pm2 reload flora-backend
```

### Replace Instance (with new user-data)

```bash
# Update user-data.sh if needed
# Then taint the instance to force replacement
terraform taint module.compute.aws_instance.backend
terraform apply

# Elastic IP will automatically reattach to new instance
```

## Files in This Module

- [terraform/modules/compute/main.tf](../terraform/modules/compute/main.tf): EC2 instance, Elastic IP, and data sources
- [terraform/modules/compute/variables.tf](../terraform/modules/compute/variables.tf): Input variables
- [terraform/modules/compute/outputs.tf](../terraform/modules/compute/outputs.tf): Exported values
- [terraform/modules/compute/user-data.sh](../terraform/modules/compute/user-data.sh): Automated deployment script
