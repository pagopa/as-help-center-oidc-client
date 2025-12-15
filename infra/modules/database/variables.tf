variable "cac-oidc-auth-session-table" {
  type = object({
    deletion_protection_enabled = optional(bool, false)
  })
}