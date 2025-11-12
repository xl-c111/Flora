# terraform/outputs.tf

# Storage module outputs
output "frontend_bucket_name" {
  description = "Frontend S3 bucket name for deployment"
  value       = module.storage.frontend_bucket_name
}

output "frontend_bucket_arn" {
  description = "Frontend S3 bucket ARN"
  value       = module.storage.frontend_bucket_arn
}

output "backups_bucket_name" {
  description = "Backups S3 bucket name"
  value       = module.storage.backups_bucket_name
}

output "frontend_sync_command" {
  description = "Command to sync frontend to S3"
  value       = module.storage.sync_command
}

# CDN module outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = module.cdn.cloudfront_distribution_id
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = module.cdn.cloudfront_url
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cdn.cloudfront_domain_name
}

# Networking outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

# Database outputs
output "rds_endpoint" {
  description = "RDS database endpoint (hostname:port)"
  value       = module.database.db_endpoint
}

output "rds_endpoint_hostname" {
  description = "RDS database hostname (without port)"
  value       = module.database.db_endpoint_hostname
}

output "db_name" {
  description = "Database name"
  value       = module.database.db_name
}

# Compute outputs
output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = module.compute.instance_id
}

output "ec2_public_ip" {
  description = "EC2 instance public IP (Elastic IP)"
  value       = module.compute.instance_public_ip
}

output "backend_url" {
  description = "Backend API URL"
  value       = module.compute.backend_url
}

output "ssh_command" {
  description = "SSH command to connect to EC2 instance"
  value       = module.compute.ssh_command
}

# Deployment summary
output "deployment_summary" {
  description = "Deployment summary with all important URLs and IPs"
  value = {
    frontend_url  = module.cdn.cloudfront_url
    backend_url   = module.compute.backend_url
    ec2_public_ip = module.compute.instance_public_ip
    rds_endpoint  = module.database.db_endpoint
    ssh_command   = module.compute.ssh_command
  }
}
