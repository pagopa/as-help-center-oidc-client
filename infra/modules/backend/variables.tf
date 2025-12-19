variable "account_id" {
  type        = string
  description = "AWS Account id."
}

variable "aws_region" {
  type        = string
  description = "AWS Region."
}

variable "env_short" {
  type        = string
  description = "env short"
}

variable "role_prefix" {
  type        = string
  description = "IAM Role prefix."
}

variable "github_repository" {
  type        = string
  description = "Github repository responsible to deploy ECS tasks in the form <organization|user/repository>."
}

variable "oidc_lambda" {
  type = object({
    name                              = string
    filename                          = string
    environment_variables             = map(string)
    cloudwatch_logs_retention_in_days = number
    table_cac_oidc_auth_session_arn   = optional(string, "")
  })
}

variable "kms_auth_session_table_alias_arn" {
  type        = string
  description = "Kms key used to encrypt and decrypt auth session table."
}