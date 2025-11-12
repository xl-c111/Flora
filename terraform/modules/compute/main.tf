# Data source to get the latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 instance for backend
resource "aws_instance" "backend" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_pair_name

  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  associate_public_ip_address = true

  iam_instance_profile = var.instance_profile_name

  # User data script for automated deployment
  user_data = templatefile("${path.module}/user-data.sh", {
    RDS_ENDPOINT = var.rds_endpoint
  })

  # Root volume configuration (20GB gp3 for better performance)
  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-backend-root-${var.environment}"
    }
  }

  # Enable detailed monitoring (Free Tier: 10 detailed metrics)
  monitoring = true

  # Metadata service configuration (IMDSv2 for better security)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name        = "${var.project_name}-backend-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }

  # Wait for user-data to complete before considering instance ready
  user_data_replace_on_change = true

  lifecycle {
    create_before_destroy = false
  }
}

# Elastic IP for static public IP (Free when attached to running instance)
resource "aws_eip" "backend" {
  domain = "vpc"

  tags = {
    Name        = "${var.project_name}-backend-eip-${var.environment}"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# Associate Elastic IP with EC2 instance
resource "aws_eip_association" "backend" {
  instance_id   = aws_instance.backend.id
  allocation_id = aws_eip.backend.id
}
