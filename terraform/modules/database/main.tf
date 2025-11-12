# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-db-${var.environment}"
  engine         = "postgres"
  engine_version = "15"  # AWS will use the latest 15.x version

  # Free Tier eligible instance
  instance_class    = var.db_instance_class
  allocated_storage = var.allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  # Network configuration
  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.database_security_group_id]
  publicly_accessible    = false

  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"         # UTC
  maintenance_window      = "Mon:04:00-Mon:05:00" # UTC

  # High availability (disabled for Free Tier cost savings)
  multi_az = false

  # Performance Insights (disabled for Free Tier)
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # Deletion protection (set to true in production)
  deletion_protection = false
  skip_final_snapshot = var.skip_final_snapshot

  # Final snapshot name (only used if skip_final_snapshot = false)
  final_snapshot_identifier = "${var.project_name}-db-final-snapshot-${var.environment}-${formatdate("YYYYMMDDHHmmss", timestamp())}"

  # Auto minor version upgrades
  auto_minor_version_upgrade = true

  # Parameter group for PostgreSQL tuning
  parameter_group_name = aws_db_parameter_group.postgres.name

  tags = {
    Name        = "${var.project_name}-db-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# DB Parameter Group for PostgreSQL optimization
resource "aws_db_parameter_group" "postgres" {
  name   = "${var.project_name}-postgres-params-${var.environment}"
  family = "postgres15"

  # Optimize for small instance (t3.micro)
  # Note: Values must be in 8kB units for PostgreSQL
  parameter {
    name         = "shared_buffers"
    value        = "32768"  # 256MB = 32768 * 8kB
    apply_method = "pending-reboot"  # Static parameter
  }

  parameter {
    name         = "effective_cache_size"
    value        = "98304"  # 768MB = 98304 * 8kB
    apply_method = "immediate"
  }

  parameter {
    name         = "maintenance_work_mem"
    value        = "8192"   # 64MB = 8192 * 8kB
    apply_method = "immediate"
  }

  parameter {
    name         = "work_mem"
    value        = "1024"   # 8MB = 1024 * 8kB
    apply_method = "immediate"
  }

  tags = {
    Name        = "${var.project_name}-postgres-params-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}
