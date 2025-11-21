data "aws_caller_identity" "current" {}


module "iam" {
  source            = "../modules/iam"
  prefix            = local.project
  github_repository = "pagopa/as-help-center-oidc-client"
}

# module "r53_zones" {
#   source = "../modules/dns"

#   r53_dns_zones = {
#     (var.r53_dns_zone.name) = {
#       comment = var.r53_dns_zone.comment
#     }
#   }
#   dns_record_ttl = 3600
#   rest_api = {
#     regional_domain_name = module.frontend.rest_api_regional_domain_name
#     regional_zone_id = module.frontend.rest_api_regional_zone_id
#   }
# }

# module "network" {
#   source   = "../../modules/network"
#   vpc_name = format("%s-vpc", local.project)

#   azs = ["eu-south-1a", "eu-south-1b", "eu-south-1c"]

#   vpc_cidr                  = var.vpc_cidr
#   vpc_private_subnets_cidr  = var.vpc_private_subnets_cidr
#   vpc_public_subnets_cidr   = var.vpc_public_subnets_cidr
#   vpc_internal_subnets_cidr = var.vpc_internal_subnets_cidr
#   enable_nat_gateway        = var.enable_nat_gateway
#   single_nat_gateway        = var.single_nat_gateway

# }

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