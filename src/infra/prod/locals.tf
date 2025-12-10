locals {
  project           = format("%s-%s-%s", var.app_name, var.aws_region_short, var.env_short)
  github_repository = "pagopa/as-help-center-oidc-client"
  #   cloudwatch__api_alarms_with_sns = {
  #     for key, alarm in var.api_alarms : key => merge(
  #       alarm,
  #       {
  #         sns_topic_alarm_arn = module.sns.sns_topic_arn
  #       }
  #     )
  #   }
}