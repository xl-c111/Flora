output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.postgres.id
}

output "db_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.postgres.arn
}

output "db_endpoint" {
  description = "RDS instance endpoint (hostname:port)"
  value       = aws_db_instance.postgres.endpoint
}

output "db_endpoint_hostname" {
  description = "RDS instance hostname (without port)"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgres.port
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.postgres.db_name
}

output "db_status" {
  description = "RDS instance status"
  value       = aws_db_instance.postgres.status
}
