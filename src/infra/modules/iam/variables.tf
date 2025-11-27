variable "prefix" {
  type    = string
  default = "Prefix to assign to the resources."
}

variable "github_repository" {
  type        = string
  description = "Github federation repository"
}

variable "s3_state_bucket_arn" {
  type = string
}