# AWS Free Tier Migration Guide

## Overview

This guide walks you through migrating your Flora deployment from expensive AWS RDS to free-tier optimized infrastructure.

**Cost Savings: $25-40/month → $0/month (for 12 months)**

## What Changed

### Before (Expensive)
- EC2: t3.micro ($7-10/month)
- RDS PostgreSQL: db.t3.micro ($15-25/month)
- Total: ~$25-40/month

### After (Free Tier)
- EC2: t2.micro (750 hours/month FREE for 12 months)
- PostgreSQL: Docker on EC2 (FREE)
- Total: $0/month for 12 months, then ~$7-10/month

## Architecture Changes

```
BEFORE:                          AFTER:
┌─────────────┐                 ┌─────────────────────────┐
│ EC2 t3.micro│                 │    EC2 t2.micro         │
│             │                 │  ┌──────────────────┐   │
│  Backend    │───────────────► │  │ Backend (PM2)    │   │
│  (PM2)      │                 │  └──────────────────┘   │
└─────────────┘                 │  ┌──────────────────┐   │
       │                        │  │ PostgreSQL       │   │
       │                        │  │ (Docker)         │   │
       ▼                        │  └──────────────────┘   │
┌─────────────┐                 └─────────────────────────┘
│ RDS Postgres│
│ db.t3.micro │
│             │
│ $15-20/mo   │
└─────────────┘
```

## Migration Steps

### Step 1: Pre-Migration Checklist

Before starting, ensure you have:
- [x] AWS CLI installed and configured
- [x] PostgreSQL client tools installed (`pg_dump`, `pg_restore`)
- [x] SSH access to your EC2 instance
- [x] Current RDS credentials from AWS SSM Parameter Store
- [x] 1-2 hours for the migration

### Step 2: Install PostgreSQL Client (if needed)

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Check installation
pg_dump --version
```

### Step 3: Run the Migration Script

The migration script will:
1. Backup RDS database
2. Stop backend temporarily
3. Start PostgreSQL on EC2
4. Restore data to EC2 PostgreSQL
5. Update backend configuration
6. Restart backend

```bash
# Run migration
./scripts/migrate-rds-to-ec2.sh

# Expected runtime: 10-15 minutes
```

**What to expect:**
- Downtime: ~5-10 minutes while database is being migrated
- Backup file will be created locally (keep it safe!)
- Script will output progress at each step

### Step 4: Verify Migration

After migration completes:

```bash
# 1. Check your website
open https://dzmu16crq41il.cloudfront.net

# 2. Test critical features:
# - User login
# - Product browsing
# - Add to cart
# - Checkout flow
# - Order confirmation email

# 3. Check backend logs
ssh -i ~/.ssh/flora-backend.pem ubuntu@YOUR_EC2_IP
pm2 logs flora-backend

# 4. Check PostgreSQL is running
docker ps | grep flora-postgres
```

### Step 5: Update Deployment Scripts

Update your deployment scripts to use local PostgreSQL:

```bash
./scripts/update-deployment-scripts.sh
```

This updates `scripts/deploy-backend.sh` to:
- Use localhost instead of RDS endpoint
- Ensure PostgreSQL container is running
- Generate .env with local database URL

### Step 6: Cleanup RDS (Save Money!)

**IMPORTANT: Only do this AFTER verifying everything works!**

```bash
# This will:
# 1. Create a final RDS snapshot (for safety)
# 2. Delete the RDS instance
# 3. Save ~$20/month

./scripts/cleanup-rds.sh
```

### Step 7: Update Terraform (Optional)

If you use Terraform, update your infrastructure:

```bash
cd terraform

# Apply instance type change to t2.micro
terraform apply

# After RDS cleanup, update main.tf:
cp main.tf.after-migration main.tf

# Remove RDS from state
terraform state rm module.database

# Apply changes
terraform apply
```

## Rollback Plan

If something goes wrong, you can rollback:

### Option 1: Restore from Backup

```bash
# Your backup file is saved locally
BACKUP_FILE="flora_rds_backup_YYYYMMDD_HHMMSS.sql"

# Restore to RDS
PGPASSWORD="your_password" pg_restore \
  -h YOUR_RDS_ENDPOINT \
  -U flora_user \
  -d flora_db \
  --clean \
  $BACKUP_FILE
```

### Option 2: Restore Original Deployment Script

```bash
# Restore original deploy-backend.sh
mv scripts/deploy-backend.sh.backup scripts/deploy-backend.sh

# Deploy with RDS connection
./scripts/deploy-backend.sh
```

## Cost Breakdown

### AWS Free Tier Limits (12 months)

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| EC2 t2.micro | 750 hours/month | ~$7-10/month |
| EBS (30GB) | 30GB SSD | $3/month |
| S3 | 5GB storage | Minimal |
| CloudFront | 1TB data transfer | Minimal |
| SSM | Free | Free |

**Total: $0/month for 12 months, then ~$10-15/month**

### What You Save

- RDS PostgreSQL: **$15-25/month saved**
- EC2 upgrade (t3→t2): **$2-3/month saved**
- Total savings: **$17-28/month**

## Monitoring

After migration, monitor your resources:

```bash
# Check EC2 instance
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=flora-backend-production" \
  --query 'Reservations[0].Instances[0].{State:State.Name,Type:InstanceType}'

# Check PostgreSQL container
ssh -i ~/.ssh/flora-backend.pem ubuntu@YOUR_EC2_IP \
  'docker stats flora-postgres --no-stream'

# Check disk usage
ssh -i ~/.ssh/flora-backend.pem ubuntu@YOUR_EC2_IP \
  'df -h'
```

## Maintenance

### Database Backups

Set up automated backups for PostgreSQL:

```bash
# Create backup directory
ssh -i ~/.ssh/flora-backend.pem ubuntu@YOUR_EC2_IP \
  'mkdir -p /home/ubuntu/Flora/backups'

# Backup script (run weekly)
docker exec flora-postgres pg_dump \
  -U flora_user \
  -F c \
  -f /backups/flora_backup_$(date +%Y%m%d).sql \
  flora_db

# Optional: Copy backups to S3
aws s3 sync /home/ubuntu/Flora/backups s3://your-backup-bucket/
```

### Database Restore

If you need to restore from backup:

```bash
# Stop backend
pm2 stop flora-backend

# Restore database
docker exec flora-postgres pg_restore \
  -U flora_user \
  -d flora_db \
  --clean \
  /backups/flora_backup_YYYYMMDD.sql

# Start backend
pm2 restart flora-backend
```

## FAQ

### Q: Will this affect performance?
**A:** Minimal impact. PostgreSQL on the same EC2 instance may actually be slightly faster due to localhost connection (no network latency).

### Q: What about data safety?
**A:**
- Keep regular backups (automated script recommended)
- RDS snapshot is kept after deletion (can restore if needed)
- EBS volumes are backed by AWS infrastructure

### Q: Can I upgrade later?
**A:** Yes! You can always migrate back to RDS or upgrade to a larger EC2 instance.

### Q: What happens after 12 months?
**A:** EC2 costs resume (~$7-10/month). Still 60% cheaper than current setup!

### Q: Will Docker use too much memory?
**A:** PostgreSQL container is limited to 512MB. t2.micro has 1GB RAM, plenty for both backend and database.

## Troubleshooting

### PostgreSQL won't start

```bash
# Check Docker logs
docker logs flora-postgres

# Restart container
docker-compose -f docker-compose.ec2.yml restart postgres

# Check disk space
df -h
```

### Backend can't connect to database

```bash
# Check DATABASE_URL in .env
cat apps/backend/.env | grep DATABASE_URL

# Should be: postgresql://user:pass@localhost:5432/flora_db

# Test connection
docker exec flora-postgres psql -U flora_user -d flora_db -c "SELECT version();"
```

### Out of memory

```bash
# Check memory usage
free -h

# Restart services
pm2 restart flora-backend
docker-compose -f docker-compose.ec2.yml restart postgres
```

## Support

If you encounter issues:
1. Check logs: `pm2 logs flora-backend`
2. Check database: `docker logs flora-postgres`
3. Restore from backup if needed
4. Keep RDS snapshot for emergency rollback

## Summary

- ✅ Created migration scripts
- ✅ Updated Terraform to use t2.micro
- ✅ Created PostgreSQL docker-compose for EC2
- ✅ Updated deployment scripts
- ✅ Created cleanup script for RDS

**Next Action:** Run `./scripts/migrate-rds-to-ec2.sh` when ready!
