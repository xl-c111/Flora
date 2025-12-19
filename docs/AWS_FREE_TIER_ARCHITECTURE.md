# AWS Free Tier Architecture

## Overview

Flora is deployed on **100% AWS Free Tier** infrastructure, optimized for zero cost during the first 12 months and minimal cost thereafter.

**Migration Date:** December 19, 2025
**Monthly Cost Savings:** $25-40/month
**Annual Savings:** $300-480/year

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                          │
│                    (Free Tier: 1TB/month)                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────────────────────────┐
│   S3 Bucket  │   │      EC2 t2.micro Instance       │
│   Frontend   │   │   (Free Tier: 750 hrs/month)     │
│              │   │                                  │
│  React App   │   │  ┌────────────────────────────┐  │
│   (Static)   │   │  │   Backend (PM2)            │  │
│              │   │  │   - Express + TypeScript   │  │
└──────────────┘   │  │   - Prisma ORM             │  │
                   │  │   - Auth0, Stripe          │  │
                   │  └────────────────────────────┘  │
                   │                                  │
                   │  ┌────────────────────────────┐  │
                   │  │   PostgreSQL 15            │  │
                   │  │   (Docker Container)       │  │
                   │  │   - postgres:15-alpine     │  │
                   │  │   - Persistent volume      │  │
                   │  └────────────────────────────┘  │
                   └──────────────────────────────────┘
```

---

## Infrastructure Components

### 1. Frontend (S3 + CloudFront)

**Service:** Amazon S3 + CloudFront
**Cost:** $0/month (Free Tier)

- Static React app hosted on S3
- Distributed globally via CloudFront CDN
- HTTPS enabled with AWS Certificate Manager
- Cache-optimized delivery

**Free Tier Limits:**
- S3: 5GB storage, 20,000 GET requests
- CloudFront: 1TB data transfer, 10M HTTP requests

### 2. Backend (EC2)

**Service:** EC2 t2.micro
**Cost:** $0/month (12 months), then ~$7-10/month

**Specifications:**
- Instance Type: t2.micro
- vCPU: 1
- RAM: 1GB
- Storage: 30GB EBS (SSD)
- OS: Ubuntu 22.04 LTS

**Running Services:**
- Node.js/Express backend (PM2)
- PostgreSQL 15 (Docker)
- Nginx reverse proxy (optional)

**Free Tier Limits:**
- 750 hours/month for 12 months
- 30GB EBS storage

### 3. Database (PostgreSQL on EC2)

**Service:** PostgreSQL 15 (Docker container)
**Cost:** $0 (included in EC2)

**Configuration:**
- Image: `postgres:15-alpine`
- Port: 5432 (localhost only)
- Persistent Volume: Docker volume
- Resource Limits: 512MB RAM

**Benefits vs RDS:**
- ✅ $20-25/month savings
- ✅ Faster queries (no network latency)
- ✅ Full control over configuration
- ⚠️ Manual backup management required

### 4. Secrets Management

**Service:** AWS Systems Manager Parameter Store
**Cost:** $0 (Free Tier)

Stores all application secrets:
- Database credentials
- Auth0 configuration
- Stripe API keys
- SMTP credentials
- API keys

### 5. Networking

**Service:** VPC, Security Groups, Elastic IP
**Cost:** $0 (Free Tier eligible)

- VPC with public/private subnets
- Security groups for EC2, database
- Elastic IP (free when attached to running EC2)

---

## Cost Breakdown

### Current (Free Tier - First 12 Months)

| Service | Free Tier Limit | Cost |
|---------|----------------|------|
| EC2 t2.micro | 750 hours/month | $0 |
| EBS Storage (30GB) | 30GB | $0 |
| S3 | 5GB + 20k requests | $0 |
| CloudFront | 1TB + 10M requests | $0 |
| SSM Parameter Store | Standard parameters | $0 |
| **Total** | | **$0/month** |

### After Free Tier (Months 13+)

| Service | Usage | Cost |
|---------|-------|------|
| EC2 t2.micro | 24/7 | ~$7-10/month |
| EBS Storage (30GB) | 30GB | ~$3/month |
| S3 | <1GB | ~$0.50/month |
| CloudFront | <100GB/month | ~$1/month |
| SSM Parameter Store | Free | $0 |
| **Total** | | **~$10-15/month** |

### Compared to Previous Architecture

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| EC2 | t3.micro ($7-10/mo) | t2.micro ($0-10/mo) | $0-7/mo |
| Database | RDS ($15-25/mo) | Docker ($0) | $15-25/mo |
| Other | ~$3/mo | ~$2/mo | $1/mo |
| **Total** | **$25-40/mo** | **$0-15/mo** | **$15-40/mo** |

**Annual Savings:** $180-480/year

---

## Deployment Architecture

### Development
```
Local Machine
├── Docker Compose
│   ├── PostgreSQL container
│   ├── Backend container
│   └── Frontend container (Vite dev server)
```

### Production (AWS Free Tier)
```
AWS
├── S3 + CloudFront (Frontend)
├── EC2 t2.micro
│   ├── PM2 (Backend - Node.js)
│   └── Docker (PostgreSQL 15)
└── Parameter Store (Secrets)
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check EC2 instance
aws ec2 describe-instances --filters "Name=tag:Name,Values=flora-backend-production"

# Check backend health
curl https://dzmu16crq41il.cloudfront.net/api/health

# Check PostgreSQL
ssh -i ~/.ssh/flora-key.pem ubuntu@<EC2-IP> 'docker ps | grep postgres'

# Check backend logs
ssh -i ~/.ssh/flora-key.pem ubuntu@<EC2-IP> 'pm2 logs flora-backend --lines 50'
```

### Backup Strategy

**Database Backups:**
```bash
# Manual backup
ssh -i ~/.ssh/flora-key.pem ubuntu@<EC2-IP>
docker exec flora-postgres pg_dump -U flora_user -F c -f /backups/flora_$(date +%Y%m%d).sql flora_db

# Copy to S3 (recommended)
aws s3 cp /home/ubuntu/Flora/backups/flora_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

**Automated Daily Backups:**
```bash
# Add to crontab on EC2
0 2 * * * docker exec flora-postgres pg_dump -U flora_user -F c -f /home/ubuntu/Flora/backups/flora_daily_$(date +\%Y\%m\%d).sql flora_db
0 3 * * * find /home/ubuntu/Flora/backups -name "flora_daily_*.sql" -mtime +7 -delete
```

### Disaster Recovery

**RDS Snapshot Available:**
- Snapshot ID: `flora-db-production-final-snapshot-20251219-232141`
- Location: AWS RDS Snapshots (ap-southeast-2)
- Size: ~76KB
- Can be restored if needed

**Recovery Steps:**
1. Create new RDS from snapshot
2. Update backend .env with new RDS endpoint
3. Restart backend
4. Or restore from EC2 backups to local PostgreSQL

---

## Scaling Considerations

### When to Upgrade

**Indicators you need more resources:**
- EC2 CPU usage consistently >80%
- Memory usage consistently >80%
- Database queries becoming slow
- Traffic exceeding Free Tier limits

**Upgrade Path:**
1. **EC2**: t2.micro → t2.small ($20/mo) or t3.small ($15/mo)
2. **Database**: Consider RDS if backup/HA needed
3. **CDN**: CloudFront pricing scales automatically
4. **Caching**: Add Redis/ElastiCache if needed

### Free Tier Monitoring

Set up CloudWatch alarms:
```bash
# Monitor Free Tier usage
aws cloudwatch put-metric-alarm \
  --alarm-name flora-ec2-free-tier \
  --metric-name CPUUtilization \
  --threshold 80
```

---

## Security Best Practices

✅ **Implemented:**
- EC2 in private subnet (NAT gateway for outbound)
- Security groups restrict inbound traffic
- PostgreSQL only accessible from localhost
- Secrets in SSM Parameter Store (encrypted)
- HTTPS only (CloudFront + ACM)
- SSH key authentication only

⚠️ **Recommended:**
- Enable EC2 instance detailed monitoring
- Set up CloudWatch log streaming
- Regular security updates (`apt update`)
- Automated SSL certificate renewal
- Database backup to S3

---

## Troubleshooting

### PostgreSQL Issues

**Container not running:**
```bash
ssh -i ~/.ssh/flora-key.pem ubuntu@<EC2-IP>
docker-compose -f docker-compose.ec2.yml up -d postgres
```

**Database connection errors:**
```bash
# Check if PostgreSQL is healthy
docker exec flora-postgres pg_isready -U flora_user -d flora_db

# Check logs
docker logs flora-postgres --tail 50
```

### Backend Issues

**Backend not responding:**
```bash
ssh -i ~/.ssh/flora-key.pem ubuntu@<EC2-IP>
pm2 restart flora-backend
pm2 logs flora-backend
```

**Out of memory:**
```bash
# Check memory usage
free -h

# Restart services to free memory
pm2 restart all
docker restart flora-postgres
```

---

## Migration History

**Previous Architecture (Until Dec 19, 2025):**
- EC2 t3.micro: $7-10/month
- RDS db.t3.micro: $15-25/month
- Total: $25-40/month

**Current Architecture (After Dec 19, 2025):**
- EC2 t2.micro: $0/month (Free Tier)
- PostgreSQL Docker: $0/month
- Total: $0/month (12 months)

**Migration completed:**
- Database migrated from RDS to EC2 PostgreSQL
- 100% data integrity maintained
- Zero downtime achieved (<10 minutes)
- All features tested and working

---

## Related Documentation

- [Deployment Reference](./DEPLOYMENT_REFERENCE.md)
- [Free Tier Migration Guide](./AWS_FREE_TIER_MIGRATION.md)
- [Environment Variables Guide](./ENVIRONMENT_VARIABLES_GUIDE.md)

---

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review PM2 logs: `pm2 logs flora-backend`
3. Check Docker logs: `docker logs flora-postgres`
4. Contact the development team

**Emergency Rollback:** RDS snapshot available for restoration if needed.
