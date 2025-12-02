terraform {
  backend "s3" {
    bucket       = "terraform-backend-1764179827"
    key          = "prod/main/tfstate"
    region       = "eu-south-1"
    encrypt      = true
    use_lockfile = true
  }
}