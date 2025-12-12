terraform {
  backend "s3" {
    bucket       = "terraform-backend-1763050671"
    key          = "dev/main/tfstate"
    region       = "eu-south-1"
    encrypt      = true
    use_lockfile = true
  }
}