# terraform/main.tf

# Data sources for secrets from SSM Parameter Store
data "aws_ssm_parameter" "db_password" {
  name            = "/flora/prod/db_password"
  with_decryption = true
}

data "aws_ssm_parameter" "auth0_domain" {
  name            = "/flora/prod/auth0_domain"
  with_decryption = true
}

data "aws_ssm_parameter" "auth0_client_id" {
  name            = "/flora/prod/auth0_client_id"
  with_decryption = true
}

data "aws_ssm_parameter" "auth0_client_secret" {
  name            = "/flora/prod/auth0_client_secret"
  with_decryption = true
}

data "aws_ssm_parameter" "auth0_audience" {
  name            = "/flora/prod/auth0_audience"
  with_decryption = true
}

data "aws_ssm_parameter" "stripe_secret_key" {
  name            = "/flora/prod/stripe_secret_key"
  with_decryption = true
}

data "aws_ssm_parameter" "stripe_webhook_secret" {
  name            = "/flora/prod/stripe_webhook_secret"
  with_decryption = true
}

data "aws_ssm_parameter" "stripe_weekly_price_id" {
  name            = "/flora/prod/stripe_weekly_price_id"
  with_decryption = true
}

data "aws_ssm_parameter" "stripe_monthly_price_id" {
  name            = "/flora/prod/stripe_monthly_price_id"
  with_decryption = true
}

data "aws_ssm_parameter" "stripe_spontaneous_price_id" {
  name            = "/flora/prod/stripe_spontaneous_price_id"
  with_decryption = true
}

data "aws_ssm_parameter" "gmail_user" {
  name            = "/flora/prod/gmail_user"
  with_decryption = true
}

data "aws_ssm_parameter" "gmail_password" {
  name            = "/flora/prod/gmail_password"
  with_decryption = true
}

data "aws_ssm_parameter" "jwt_secret" {
  name            = "/flora/prod/jwt_secret"
  with_decryption = true
}

data "aws_ssm_parameter" "gemini_api_key" {
  name            = "/flora/prod/gemini_api_key"
  with_decryption = true
}

# Storage module - S3 buckets for frontend and backups
module "storage" {
  source = "./modules/storage"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  enable_versioning    = true
  enable_backup_bucket = true

  # CloudFront OAI IAM ARN for bucket policy (passed after CDN module is created)
  cloudfront_distribution_arn = module.cdn.cloudfront_distribution_arn
  cloudfront_oai_iam_arn      = module.cdn.cloudfront_oai_iam_arn
}

# CDN module - CloudFront distribution for frontend
module "cdn" {
  source = "./modules/cdn"

  project_name = var.project_name
  environment  = var.environment

  # S3 bucket information from storage module
  s3_bucket_name                 = module.storage.frontend_bucket_name
  s3_bucket_id                   = module.storage.frontend_bucket_id
  s3_bucket_arn                  = module.storage.frontend_bucket_arn
  s3_bucket_regional_domain_name = module.storage.frontend_bucket_regional_domain_name

  # Backend API server information from compute module
  # Use EC2 public DNS name (CloudFront accepts DNS names, not IPs)
  backend_domain_name = "ec2-15-134-175-113.ap-southeast-2.compute.amazonaws.com"
  backend_port        = 3001

  # Use PriceClass_100 for cost savings (North America and Europe only)
  price_class = "PriceClass_100"
}

# Additional SSM parameters for database
data "aws_ssm_parameter" "db_username" {
  name            = "/flora/prod/db_username"
  with_decryption = true
}

# Networking module - VPC, subnets, security groups
module "networking" {
  source = "./modules/networking"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

# IAM module - EC2 instance profile with SSM access
module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

# ============================================================================
# DATABASE MODULE - REMOVED (Cost Optimization)
# ============================================================================
# RDS PostgreSQL has been replaced with PostgreSQL running in Docker on EC2
# to optimize for AWS Free Tier. Database now runs via docker-compose.ec2.yml
#
# Migration completed: 2025-12-19
# Backup saved: flora-db-production-final-snapshot-20251219-232141
# Cost savings: ~$20-25/month
#
# If you need to restore RDS, use the snapshot or contact your team.
# ============================================================================

# module "database" {
#   source = "./modules/database"
#
#   project_name = var.project_name
#   environment  = var.environment
#
#   db_name     = "flora_db"
#   db_username = data.aws_ssm_parameter.db_username.value
#   db_password = data.aws_ssm_parameter.db_password.value
#
#   db_subnet_group_name       = module.networking.db_subnet_group_name
#   database_security_group_id = module.networking.database_security_group_id
#
#   # Free Tier settings
#   db_instance_class = "db.t3.micro"
#   allocated_storage = 20
#   postgres_version  = "15.4"
#
#   skip_final_snapshot = true
# }

# Compute module - EC2 instance for backend
module "compute" {
  source = "./modules/compute"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  instance_type = var.instance_type
  key_pair_name = var.key_pair_name

  vpc_id             = module.networking.vpc_id
  subnet_id          = module.networking.public_subnet_1_id
  security_group_ids = [module.networking.backend_security_group_id]

  instance_profile_name = module.iam.instance_profile_name
  rds_endpoint          = "localhost"  # PostgreSQL runs locally in Docker

  depends_on = [module.iam]
}
