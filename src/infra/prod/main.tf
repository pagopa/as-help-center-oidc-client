data "aws_caller_identity" "current" {}

data "aws_s3_bucket" "state_bucket" {
  bucket = "terraform-backend-1764179827"
}

module "iam" {
  source              = "../modules/iam"
  prefix              = local.project
  github_repository   = "pagopa/as-help-center-oidc-client"
  s3_state_bucket_arn = data.aws_s3_bucket.state_bucket.arn
}

module "lambda" {
  source = "../modules/backend"

  account_id = data.aws_caller_identity.current.account_id
  aws_region = var.aws_region
  oidc_lambda = {
    name                              = format("%s-oidc-client", local.project)
    filename                          = "${path.module}/../hello-js/lambda.zip"
    cloudwatch_logs_retention_in_days = var.lambda_cloudwatch_logs_retention_in_days
    environment_variables = {
      HOST                 = var.r53_dns_zone.name
      NODE_ENV             = "production"
      PARAMETER_STORE_PATH = "cac-oidc-client"
    }
  }
  github_repository = local.github_repository
  env_short         = var.env_short
  role_prefix       = local.project
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

  api_gateway_target_arns   = ["LAMBDA"]
  oidc_lambda_arn           = module.lambda.oidc_lambda_arn
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
    "ns-1569.awsdns-04.co.uk",
    "ns-1112.awsdns-11.org",
    "ns-1005.awsdns-61.net",
    "ns-7.awsdns-00.com"
  ]
}