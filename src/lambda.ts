import type { APIGatewayProxyEventV2, Context, APIGatewayProxyResult } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { loadParametersIntoEnv } from './utils/parameterStore';

let serverlessExpressInstance: any = null;

// Initialize Lambda handler once per lambda lifecycle
async function setup(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult> {
  await loadParametersIntoEnv();

  // Import app only after getting env vars, so the app reads correct env values
  const mod = await import('./app');
  const app = mod.default;

  // Wrap express app to work with lambda and api gtw
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

export const lambdaHandler = (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult> => {
  // If already initialized, use the ready handler
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }

  return setup(event, context);
};
