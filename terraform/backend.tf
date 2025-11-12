terraform {
  backend "s3" {
    bucket         = "flora-terraform-state-626614672892"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "flora-terraform-locks"
    encrypt        = true
  }
}
