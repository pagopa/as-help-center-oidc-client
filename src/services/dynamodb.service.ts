import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import config from '@config/env';
import { NODE_ENV_VALUES } from '@utils/constants';
import { AuthSessionRecord } from 'src/types/auth.types';

const DYNAMODB_TABLE_NAME = config.dynamodb.tableName;

// DynamoDB client setup
const dynamoClient = new DynamoDBClient({
  region: config.dynamodb.region,
  // for local development add dynamo endpoint and fake credentials
  ...(config.server.environment === NODE_ENV_VALUES.local &&
    config.dynamodb.endpoint && {
      endpoint: config.dynamodb.endpoint,
      credentials: {
        accessKeyId: 'local',
        secretAccessKey: 'local',
      },
    }),
  // In production/development, credentials are handled by IAM role attached to Lambda
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function storeAuthSessionRecord(record: Omit<AuthSessionRecord, 'ttl'>): Promise<void> {
  const params = {
    TableName: DYNAMODB_TABLE_NAME,
    Item: {
      ...record,
      ttl: Math.floor(Date.now() / 1000) + config.dynamodb.stateTtlSeconds,
    },
  };

  await docClient.send(new PutCommand(params));
}

export async function getAndDeleteAuthSessionRecord(state: string): Promise<AuthSessionRecord | null> {
  const params = {
    TableName: DYNAMODB_TABLE_NAME,
    Key: { state },
    ConditionExpression: 'attribute_exists(#state)', // Delete only if record exists
    ExpressionAttributeNames: { '#state': 'state' },
    ReturnValues: 'ALL_OLD' as const, // Return the record before deletion
  };

  try {
    const result = await docClient.send(new DeleteCommand(params));
    return result.Attributes ? (result.Attributes as AuthSessionRecord) : null;
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      // Record doesn't exist = replay attack blocked
      return null;
    }
    throw error;
  }
}
