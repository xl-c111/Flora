output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.backend.id
}

output "instance_public_ip" {
  description = "EC2 instance public IP address (from Elastic IP)"
  value       = aws_eip.backend.public_ip
}

output "instance_private_ip" {
  description = "EC2 instance private IP address"
  value       = aws_instance.backend.private_ip
}

output "instance_state" {
  description = "EC2 instance state"
  value       = aws_instance.backend.instance_state
}

output "elastic_ip_id" {
  description = "Elastic IP allocation ID"
  value       = aws_eip.backend.id
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.backend.public_ip}:3001"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_eip.backend.public_ip}"
}
