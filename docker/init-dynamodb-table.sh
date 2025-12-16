#!/bin/bash
set -e

# Create DynamoDB table (local development)
# Usage: ./scripts/init-dynamodb-table.sh

TABLE_NAME="${DYNAMODB_TABLE_NAME:-cac-oidc-auth-session}"
ENDPOINT="${DYNAMODB_ENDPOINT:-http://localhost:8000}"
REGION="${AWS_REGION:-eu-south-1}"

echo "Creating DynamoDB table: $TABLE_NAME"
echo "Endpoint: $ENDPOINT"
echo "Region: $REGION"

# Use inline environment variables to avoid overwriting real AWS credentials in the shell
# DynamoDB Local requires credentials but doesn't validate them
AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local \
aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=state,AttributeType=S \
  --key-schema \
    AttributeName=state,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --no-cli-pager

echo "Enabling TTL on 'ttl' attribute..."
AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local \
aws dynamodb update-time-to-live \
  --table-name "$TABLE_NAME" \
  --time-to-live-specification "Enabled=true, AttributeName=ttl" \
  --endpoint-url "$ENDPOINT" \
  --region "$REGION" \
  --no-cli-pager

echo "Table $TABLE_NAME created successfully with TTL enabled"
# To verify, run: 
# AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local \
# aws dynamodb describe-table --table-name $TABLE_NAME --endpoint-url $ENDPOINT --region $REGION"
