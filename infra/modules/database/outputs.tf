output "table_cac_oidc_auth_session_arn" {
  value = module.dynamodb_table_cac_oidc_auth_session.dynamodb_table_arn
}

output "kms_auth_session_table_alias_arn" {
  value = module.kms_auth_session_table.aliases[local.kms_auth_session_table_alias].target_key_arn
}