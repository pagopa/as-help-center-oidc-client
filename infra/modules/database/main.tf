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

  billing_mode                = "PAY_PER_REQUEST"
  ttl_attribute_name          = "ttl"
  ttl_enabled                 = var.cac-oidc-auth-session-table.ttl_enabled
  deletion_protection_enabled = var.cac-oidc-auth-session-table.deletion_protection_enabled
  tags = {
    Name = "cac-oidc-auth-session"
  }

}