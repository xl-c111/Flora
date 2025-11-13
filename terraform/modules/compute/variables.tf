variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_pair_name" {
  description = "SSH key pair name for EC2 access"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where EC2 will be launched"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for EC2 instance (should be public subnet)"
  type        = string
}

variable "security_group_ids" {
  description = "List of security group IDs to attach to EC2"
  type        = list(string)
}

variable "instance_profile_name" {
  description = "IAM instance profile name for EC2"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS database endpoint (hostname only, no port)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for SSM parameter store access"
  type        = string
  default     = "ap-southeast-2"
}
