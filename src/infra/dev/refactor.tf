import {
  to = module.iam.aws_iam_role.githubiac
  id = "es-1-d-cac-github-iac-role"
}


import {
  to = module.iam.aws_iam_role_policy_attachment.githubiac
  id = "es-1-d-cac-github-iac-role/arn:aws:iam::aws:policy/AdministratorAccess"
}

import {
  to = module.iam.aws_iam_role.githubiac_plan
  id = "es-1-d-cac-github-iac-role-plan"
}


import {
  to = module.lambda.aws_iam_role.github_lambda_deploy
  id = "es-1-d-cac-deploy-lambda"
}

import {
  to = module.lambda.aws_iam_policy.deploy_lambda
  id = "arn:aws:iam::865171028670:policy/es-1-d-cac-deploy-lambda"
}

import {
  to = module.iam.aws_iam_policy.githubiac_plan_policy
  id = "arn:aws:iam::865171028670:policy/es-1-d-cac-github-iac-policy-plan"
}

