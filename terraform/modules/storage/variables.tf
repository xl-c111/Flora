variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-2"
}

variable "enable_versioning" {
  description = "Enable versioning for S3 buckets"
  type        = bool
  default     = true
}

variable "enable_backup_bucket" {
  description = "Create a separate bucket for backups"
  type        = bool
  default     = true
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN for bucket policy (optional, can be set later)"
  type        = string
  default     = ""
}

variable "cloudfront_oai_iam_arn" {
  description = "CloudFront Origin Access Identity IAM ARN for bucket policy"
  type        = string
  default     = ""
}
