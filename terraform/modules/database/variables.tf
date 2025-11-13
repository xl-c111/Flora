variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
}

variable "db_name" {
  description = "Name of the database to create"
  type        = string
  default     = "flora_db"
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Master password for the database"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # Free Tier eligible for 12 months
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20 # Free Tier: up to 20GB
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.4"
}

variable "backup_retention_period" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying (set to false in production)"
  type        = bool
  default     = true
}

variable "db_subnet_group_name" {
  description = "Name of the DB subnet group"
  type        = string
}

variable "database_security_group_id" {
  description = "Security group ID for the database"
  type        = string
}
