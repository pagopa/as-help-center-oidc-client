import type { APIGatewayProxyEventV2, Context, APIGatewayProxyResult } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { loadParametersIntoEnv } from './utils/parameterStore';

let serverlessExpressInstance: any = null;
// Promise to prevent race conditions on concurrent cold start invocations
let initPromise: Promise<any> | null = null;

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

export const handler = (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult> => {
  // If already initialized, use the ready instance
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }

  // If initialization is in progress, reuse the promise (prevents race condition)
  if (initPromise) {
    return initPromise;
  }

  // Start initialization
  initPromise = setup(event, context);
  return initPromise;
};
