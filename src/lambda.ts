import type { Handler } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import app from './app';

// wraps express app to work with lambda and api gtw
export const lambdaHandler: Handler = serverlessExpress({ app });
