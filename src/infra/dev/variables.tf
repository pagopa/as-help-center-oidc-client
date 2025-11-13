variable "aws_region" {
  type        = string
  description = "AWS region to create resources. Default Milan"
  default     = "eu-south-1"
}

variable "tags" {
  type = map(any)
  default = {
    CreatedBy   = "Terraform"
    Environment = "Dev"
    Owner       = "CaC"
    Source      = "https://github.com/pagopa/as-help-center-oidc-client"
    CostCenter  = "tier0"
  }
}