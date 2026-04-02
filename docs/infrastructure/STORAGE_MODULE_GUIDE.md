# Storage Module Guide

This guide explains how to use the storage module for S3 buckets in the Flora deployment.

## Features

- **Frontend Bucket**: S3 bucket for hosting React static files
- **Backups Bucket**: Optional bucket for database and application backups
- **Versioning**: Rollback capability for both buckets
- **Encryption**: Server-side encryption (AES256) for all data
- **Security**: Public access blocked, CloudFront-only access
- **Lifecycle Policies**: Automatic cleanup and cost optimization
- **Free Tier Optimized**: Stays within AWS Free Tier limits

## What Gets Created

1. **Frontend S3 Bucket**:
   - Hosts React build files (HTML, JS, CSS, images)
   - CloudFront Origin Access Identity (OAI) access only
   - Versioning enabled for rollback
   - Server-side encryption
   - Public access blocked

2. **Backups S3 Bucket** (optional):
   - Stores database backups, logs, etc.
   - Automatic lifecycle management:
     - Move to Glacier after 30 days
     - Delete backups after 90 days
   - Versioning enabled
   - Public access blocked

## Prerequisites

- AWS account configured with CLI
- Terraform initialized
- CloudFront distribution ARN (optional, can be added later)

## Usage

```hcl
module "storage" {
  source = "./modules/storage"

  project_name    = "flora"
  environment     = "production"
  aws_region      = "ap-southeast-2"

  enable_versioning     = true
  enable_backup_bucket  = true

  # Optional: Add after CloudFront is created
  cloudfront_distribution_arn = module.cdn.distribution_arn
}
```

## Outputs

The module provides several useful outputs:

- `frontend_bucket_name`: Bucket name for S3 sync command
- `frontend_bucket_arn`: ARN for CloudFront origin
- `frontend_bucket_regional_domain_name`: Domain for CloudFront origin
- `backups_bucket_name`: Bucket name for backup storage
- `sync_command`: Ready-to-use AWS CLI command

## Deployment

### Step 1: Apply Terraform

```bash
cd terraform

# Plan the changes
terraform plan

# Apply the configuration
terraform apply
```

### Step 2: Get Bucket Name

```bash
# View all outputs
terraform output

# Get specific bucket name
terraform output -raw frontend_bucket_name

# Save to variable
S3_BUCKET=$(terraform output -raw frontend_bucket_name)
echo $S3_BUCKET
```

### Step 3: Build and Deploy Frontend

```bash
# Return to project root
cd ..

# Build frontend
pnpm --filter frontend build

# Sync to S3
aws s3 sync apps/frontend/dist s3://$S3_BUCKET/ --delete

# Verify upload
aws s3 ls s3://$S3_BUCKET/
```

## Frontend Deployment Commands

### Initial Deployment

```bash
# Get bucket name from Terraform
cd terraform
S3_BUCKET=$(terraform output -raw frontend_bucket_name)
cd ..

# Build and deploy
pnpm --filter frontend build
aws s3 sync apps/frontend/dist s3://$S3_BUCKET/ --delete
```

### Update Deployment

```bash
# After code changes
pnpm --filter frontend build
aws s3 sync apps/frontend/dist s3://$S3_BUCKET/ --delete

# If using CloudFront, invalidate cache
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## Backup Operations

### Manual Database Backup

```bash
# SSH into EC2 instance
ssh -i ~/.ssh/flora-key.pem ubuntu@$EC2_IP

# Create database backup
pg_dump -h <RDS_ENDPOINT> -U flora_user -d flora_db > backup_$(date +%Y%m%d).sql

# Upload to S3
BACKUP_BUCKET=$(cd terraform && terraform output -raw backups_bucket_name)
aws s3 cp backup_$(date +%Y%m%d).sql s3://$BACKUP_BUCKET/database/
```

### Restore from Backup

```bash
# Download backup
aws s3 cp s3://$BACKUP_BUCKET/database/backup_20250112.sql .

# Restore to database
psql -h <RDS_ENDPOINT> -U flora_user -d flora_db < backup_20250112.sql
```

### List Backups

```bash
# List all backups
aws s3 ls s3://$BACKUP_BUCKET/database/

# List with sizes and dates
aws s3 ls s3://$BACKUP_BUCKET/database/ --human-readable
```

## Security Features

### Bucket Policies

The frontend bucket only allows access from CloudFront:
- No direct public access
- CloudFront Origin Access Identity (OAI) required
- All other requests are denied

### Encryption

All buckets use server-side encryption (SSE-S3):
- Data encrypted at rest
- Keys managed by AWS
- No additional cost

### Versioning

Both buckets have versioning enabled:
- Accidental deletions can be recovered
- Old versions can be restored
- Lifecycle policies clean up old versions

## Cost Optimization

### Free Tier Limits

- **5 GB storage**: Both buckets combined
- **20,000 GET requests/month**: Frontend access via CloudFront
- **2,000 PUT requests/month**: Frontend updates

### Lifecycle Policies

The backups bucket automatically:
1. **After 30 days**: Move to Glacier ($0.004/GB vs $0.023/GB)
2. **After 90 days**: Delete old backups
3. **Old versions**: Delete after 30 days

### Cost Monitoring

```bash
# Check bucket sizes
aws s3 ls --summarize --human-readable --recursive s3://$S3_BUCKET/

# View S3 costs
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE \
  --filter file://<(echo '{"Dimensions":{"Key":"SERVICE","Values":["Amazon Simple Storage Service"]}}')
```

## Troubleshooting

### Bucket Name Already Exists

**Problem**: `BucketAlreadyExists` error during Terraform apply

**Solution**: S3 bucket names are globally unique. The module uses your AWS account ID in the name to ensure uniqueness. If error persists, check for leftover buckets:

```bash
aws s3 ls | grep flora
```

### Access Denied When Syncing

**Problem**: `AccessDenied` error when running `aws s3 sync`

**Solution**: Ensure your AWS CLI credentials have S3 write permissions:

```bash
# Check your identity
aws sts get-caller-identity

# Test bucket access
aws s3 ls s3://$S3_BUCKET/
```

### Frontend Files Not Updating

**Problem**: Old files still showing after deployment

**Solution**: CloudFront cache issue. Invalidate the cache:

```bash
DISTRIBUTION_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

# Wait for invalidation
aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTION_ID --id <INVALIDATION_ID>
```

### Bucket Policy Error

**Problem**: Cannot update bucket policy for CloudFront

**Solution**: Update the storage module with CloudFront ARN:

```hcl
module "storage" {
  source = "./modules/storage"

  # ... other variables ...

  cloudfront_distribution_arn = module.cdn.distribution_arn
}
```

Then run `terraform apply` again.

## Best Practices

### 1. Always Use Versioning

Versioning protects against accidental deletions:
```bash
# List all versions of a file
aws s3api list-object-versions --bucket $S3_BUCKET --prefix index.html

# Restore a previous version
aws s3api copy-object \
  --copy-source "$S3_BUCKET/index.html?versionId=VERSION_ID" \
  --bucket $S3_BUCKET \
  --key index.html
```

### 2. Regular Backups

Automate database backups with a cron job:
```bash
# On EC2 instance, add to crontab
0 2 * * * /home/ubuntu/scripts/backup-database.sh
```

### 3. Monitor Costs

Set up billing alerts:
```bash
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json
```

### 4. Use CloudFront

Always access frontend via CloudFront, not S3 directly:
- Lower latency (CDN edge locations)
- Reduced S3 costs (fewer requests)
- HTTPS support
- DDoS protection

## Production Enhancements

For production deployments, consider:

1. **Cross-Region Replication**: Replicate buckets to another region for disaster recovery
2. **S3 Intelligent-Tiering**: Automatic cost optimization based on access patterns
3. **AWS Backup**: Automated backup service for RDS and other resources
4. **Bucket Analytics**: Track usage patterns and optimize costs
5. **AWS CloudTrail**: Audit all S3 access for compliance

## Files in This Module

- [terraform/modules/storage/main.tf](../terraform/modules/storage/main.tf): S3 buckets, policies, and configurations
- [terraform/modules/storage/variables.tf](../terraform/modules/storage/variables.tf): Input variables
- [terraform/modules/storage/outputs.tf](../terraform/modules/storage/outputs.tf): Exported values including bucket names

## Next Steps

After deploying the storage module:

1. **Deploy Frontend**: Build and sync React app to S3
2. **Set Up CloudFront**: Create CDN distribution pointing to S3 bucket
3. **Configure Domain**: Optional custom domain with Route 53
4. **Automate Backups**: Create backup scripts for database

## Quick Reference

```bash
# Get bucket name
S3_BUCKET=$(cd terraform && terraform output -raw frontend_bucket_name)

# Deploy frontend
pnpm --filter frontend build && aws s3 sync apps/frontend/dist s3://$S3_BUCKET/ --delete

# Create database backup
BACKUP_BUCKET=$(cd terraform && terraform output -raw backups_bucket_name)
pg_dump ... | aws s3 cp - s3://$BACKUP_BUCKET/database/backup_$(date +%Y%m%d).sql

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```
