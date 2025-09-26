import { Request, Response, NextFunction } from 'express';
import env from '@config/env';
import { ApiError } from '@errors/ApiError';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NODE_ENV_VALUES } from '@utils/constants';

const printError = (error: unknown, envValue: string) => {
  if (env.server.environment === envValue) {
    console.error('error', error);
  }
};

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  printError(error, NODE_ENV_VALUES.development);

  let errorResponse: ApiError;

  if (error instanceof ApiError) {
    errorResponse = error;
  } else {
    printError(error, NODE_ENV_VALUES.production);
    errorResponse = new ApiError(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  errorResponse.setPath(req.originalUrl);
  res.status(errorResponse.statusCode).json(errorResponse.toJSON());
}
