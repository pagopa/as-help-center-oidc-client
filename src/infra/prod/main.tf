data "aws_caller_identity" "current" {}


module "iam" {
  source            = "../modules/iam"
  prefix            = local.project
  github_repository = "pagopa/as-help-center-oidc-client"
}


module "frontend" {
  source = "../modules/frontend"
  # DNS 
  domain_name = var.r53_dns_zone.name

  role_prefix = local.project

  ## API Gateway ##
  rest_api_name         = format("%s-restapi", local.project)
  openapi_template_file = "../api/cac.tpl.json"

  dns_record_ttl     = var.dns_record_ttl
  cors_allow_origins = "*"

  api_gateway_target_arns = ["LAMBDA"]

  aws_region                = var.aws_region
  api_cache_cluster_enabled = var.api_cache_cluster_enabled
  api_method_settings       = var.api_method_settings

  xray_tracing_enabled = var.xray_tracing_enabled
  #api_alarms           = local.cloudwatch__api_alarms_with_sns
  web_acl = {
    name = format("%s-webacl", local.project)
  }
}

resource "aws_route53_record" "dev_ns_record" {
  zone_id = module.frontend.zone_id
  name    = "dev"
  type    = "NS"
  ttl     = var.dns_record_ttl
  records = [
    "TODO: insert dev ns record 1",
  ]
}