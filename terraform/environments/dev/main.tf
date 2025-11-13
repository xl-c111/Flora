terraform {
  required_version = ">= 1.6.0"
}

module "flora" {
  source = "../.."

  environment  = "dev"
  project_name = "flora"
  aws_region   = "ap-southeast-2"

  # Example overrides for dev; adjust as needed
  ec2_instance_type = "t3.small"
  rds_instance_type = "db.t3.micro"
}
