output "frontend_bucket_id" {
  description = "Frontend S3 bucket ID"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  description = "Frontend S3 bucket ARN"
  value       = aws_s3_bucket.frontend.arn
}

output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_bucket_regional_domain_name" {
  description = "Frontend S3 bucket regional domain name"
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}

output "backups_bucket_id" {
  description = "Backups S3 bucket ID"
  value       = var.enable_backup_bucket ? aws_s3_bucket.backups[0].id : null
}

output "backups_bucket_arn" {
  description = "Backups S3 bucket ARN"
  value       = var.enable_backup_bucket ? aws_s3_bucket.backups[0].arn : null
}

output "backups_bucket_name" {
  description = "Backups S3 bucket name"
  value       = var.enable_backup_bucket ? aws_s3_bucket.backups[0].bucket : null
}

output "sync_command" {
  description = "AWS CLI command to sync frontend build to S3"
  value       = "aws s3 sync apps/frontend/dist s3://${aws_s3_bucket.frontend.bucket}/ --delete"
}
