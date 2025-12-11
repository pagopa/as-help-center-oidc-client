variable "aws_region" {
  type        = string
  description = "AWS region to create resources. Default Milan"
  default     = "eu-south-1"
}

variable "aws_region_short" {
  type        = string
  description = "AWS region short format."
  default     = "es-1"
}

variable "app_name" {
  type        = string
  description = "App name."
  default     = "cac"
}

variable "env_short" {
  type        = string
  default     = "p"
  description = "Environment short."
}


## R53 DNS zone ##
variable "r53_dns_zone" {
  type = object({
    name    = string
    comment = string
  })

  default = {
    name    = "auth-assistenza.pagopa.it"
    comment = "Cac prod zone."
  }
}

variable "lambda_cloudwatch_logs_retention_in_days" {
  type        = number
  description = "Cloudwatch log group retention days."
  default     = 14
}

# DNS
variable "dns_record_ttl" {
  type        = number
  description = "Dns record ttl (in sec)"
  default     = 3600 # one minutes
}

## Api Gateway
variable "api_cache_cluster_enabled" {
  type        = bool
  description = "Enable cache cluster is enabled for the stage."
  default     = true
}

variable "api_cache_cluster_size" {
  type        = number
  description = "Size of the cache cluster for the stage, if enabled."
  default     = 0.5
}

variable "xray_tracing_enabled" {
  type        = bool
  description = "Whether active tracing with X-ray is enabled."
  default     = false
}

variable "api_method_settings" {
  description = "List of Api Gateway method settings."
  type = list(object({
    method_path                             = string
    metrics_enabled                         = optional(bool, false)
    logging_level                           = optional(string, "OFF")
    data_trace_enabled                      = optional(bool, false)
    throttling_rate_limit                   = optional(number, -1)
    throttling_burst_limit                  = optional(number, -1)
    caching_enabled                         = optional(bool, false)
    cache_ttl_in_seconds                    = optional(number, 0)
    cache_data_encrypted                    = optional(bool, false)
    require_authorization_for_cache_control = optional(bool, false)
    cache_key_parameters                    = optional(list(string), [])
  }))
  default = [
    {
      method_path     = "*/*"
      caching_enabled = false
      metrics_enabled = true
      logging_level   = "ERROR"
    }
  ]
}

variable "rest_api_throttle_settings" {
  type = object({
    burst_limit = number
    rate_limit  = number
  })
  description = "Rest api throttle settings."
  default = {
    rate_limit  = 50
    burst_limit = 100
  }
}

variable "tags" {
  type = map(any)
  default = {
    CreatedBy   = "Terraform"
    Environment = "Prod"
    Owner       = "CAC"
    Source      = "https://github.com/pagopa/as-help-center-oidc-client"
    CostCenter  = "tier0"
  }
}

variable "api_alarms" {
  type = map(object({
    metric_name         = string
    namespace           = string
    threshold           = optional(number)
    evaluation_periods  = optional(number)
    period              = optional(number)
    statistic           = optional(string)
    comparison_operator = optional(string)
    resource_name       = string
    method              = string

  }))

  default = {
    "login-5xx-error" = {
      resource_name       = "/login"
      metric_name         = "5XXError"
      namespace           = "AWS/ApiGateway"
      evaluation_periods  = 2
      comparison_operator = "GreaterThanOrEqualToThreshold"
      period              = 300
      statistic           = "Sum"
      threshold           = 1
      method              = "GET"
    },
    "login-latency-alarm" = {
      resource_name       = "/login"
      metric_name         = "Latency"
      namespace           = "AWS/ApiGateway"
      evaluation_periods  = 2
      comparison_operator = "GreaterThanOrEqualToThreshold"
      period              = 300
      statistic           = "Average"
      method              = "GET"
      threshold           = 2000
    },
  }
}

