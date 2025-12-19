variable "cac-oidc-auth-session-table" {
  type = object({
    deletion_protection_enabled = optional(bool, false)
    ttl_enabled                 = optional(bool, true)
  })
}

variable "kms_ssm_enable_rotation" {
  type    = bool
  default = true
}

variable "kms_rotation_period_in_days" {
  type    = number
  default = 365
}