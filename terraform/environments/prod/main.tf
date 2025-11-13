terraform {
  required_version = ">= 1.6.0"
}

module "flora" {
  source = "../.."

  environment  = "prod"
  project_name = "flora"
  aws_region   = "ap-southeast-2"

  # Production overrides (change as your scaling needs grow)
  ec2_instance_type = "t3.medium"
  rds_instance_type = "db.t3.small"
}
