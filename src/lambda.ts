import type { APIGatewayProxyEventV2, Context, APIGatewayProxyResult } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { loadParametersIntoEnv } from './utils/parameterStore';

let serverlessExpressInstance: any = null;
// Promise to prevent race conditions on concurrent cold start invocations
let initPromise: Promise<void> | null = null;

// Initialize Lambda once per lambda lifecycle
async function setup(): Promise<void> {
  await loadParametersIntoEnv();

  // Import app only after getting env vars, so the app reads correct env values
  const mod = await import('./app');
  const app = mod.default;

  // Wrap express app to work with lambda and api gtw
  serverlessExpressInstance = serverlessExpress({ app });
}

function processEvent(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult> {
  return serverlessExpressInstance(event, context);
}

export const handler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResult> => {
  // If lambda was already initialized, use the ready instance for processing the event
  if (serverlessExpressInstance) {
    return processEvent(event, context);
  }

  // If initialization is in progress, wait for it and then process the event
  if (initPromise) {
    await initPromise;
    return processEvent(event, context);
  }

  // Start initialization (first request in this container)
  initPromise = setup();
  await initPromise;
  // Then process the event
  return processEvent(event, context);
};
