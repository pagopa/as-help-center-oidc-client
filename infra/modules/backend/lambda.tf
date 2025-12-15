## Github 

resource "aws_iam_role_policy_attachment" "deploy_lambda" {
  role       = aws_iam_role.github_lambda_deploy.name
  policy_arn = aws_iam_policy.deploy_lambda.id
}

resource "aws_iam_role" "github_lambda_deploy" {
  name               = format("%s-deploy-lambda", var.role_prefix)
  description        = "Role to deploy lambda functions with github actions."
  assume_role_policy = local.assume_role_policy_github
}

resource "aws_iam_policy" "deploy_lambda" {
  name        = format("%s-deploy-lambda", var.role_prefix)
  description = "Policy to deploy Lambda functions"

  policy = jsonencode({

    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:CreateFunction",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration"
        ]
        Resource = "*"
      },
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Effect = "Allow"
        Resource = [
          "${module.s3_lambda_code_bucket.s3_bucket_arn}/*"
        ]
      },
    ]
  })
}

resource "random_integer" "bucket_lambda_code_suffix" {
  min = 1000
  max = 9999
}

module "s3_lambda_code_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.1.1"

  bucket = local.bucket_lambda_code
  acl    = "private"

  control_object_ownership = true
  object_ownership         = "ObjectWriter"

  tags = {
    Name = local.bucket_lambda_code
  }
}

data "aws_iam_policy_document" "oidc_lambda" {
  statement {
    effect    = "Allow"
    actions   = ["cloudwatch:PutMetricData"]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
    ]
    resources = [
      var.oidc_lambda.table_cac_oidc_auth_session_arn
    ]
  }
  statement {
    sid    = "SSMGetParameters"
    effect = "Allow"
    actions = [
      "ssm:Get*",
      "ssm:Describe*",
      "ssm:List*",
      "ssm:GetParametersByPath"
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${var.account_id}:parameter/${var.oidc_lambda.environment_variables.PARAMETER_STORE_PATH}*"
    ]
  }
}

module "oidc_lambda" {
  source                 = "terraform-aws-modules/lambda/aws"
  version                = "7.4.0"
  function_name          = var.oidc_lambda.name
  description            = "Lambda function oidc."
  runtime                = "nodejs22.x"
  handler                = "lambda.handler"
  create_package         = false
  local_existing_package = var.oidc_lambda.filename

  ignore_source_code_hash = true

  publish = true

  attach_policy_json = true
  policy_json        = data.aws_iam_policy_document.oidc_lambda.json

  environment_variables = var.oidc_lambda.environment_variables



  memory_size = 512
  timeout     = 30

  cloudwatch_logs_retention_in_days = var.oidc_lambda.cloudwatch_logs_retention_in_days

}



