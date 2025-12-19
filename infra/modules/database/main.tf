locals {
  kms_auth_session_table_alias = "/dynamodb/auth-session"
}

module "kms_auth_session_table" {
  source  = "terraform-aws-modules/kms/aws"
  version = "3.0.0"

  description             = "KMS key for Dynamodb table encryption."
  key_usage               = "ENCRYPT_DECRYPT"
  enable_key_rotation     = var.kms_ssm_enable_rotation
  rotation_period_in_days = var.kms_rotation_period_in_days

  # Aliases
  aliases = [local.kms_auth_session_table_alias]
}

module "dynamodb_table_cac_oidc_auth_session" {
  source  = "terraform-aws-modules/dynamodb-table/aws"
  version = "5.0.0"

  name = "cac-oidc-auth-session"

  hash_key = "state"

  attributes = [
    {
      name = "state"
      type = "S"
    }
  ]

  billing_mode                       = "PAY_PER_REQUEST"
  ttl_attribute_name                 = "ttl"
  ttl_enabled                        = var.cac-oidc-auth-session-table.ttl_enabled
  server_side_encryption_enabled     = true
  server_side_encryption_kms_key_arn = module.kms_auth_session_table.aliases[local.kms_auth_session_table_alias].target_key_arn
  deletion_protection_enabled        = var.cac-oidc-auth-session-table.deletion_protection_enabled
  tags = {
    Name = "cac-oidc-auth-session"
  }

}