import { ApiError } from '@errors/ApiError';
import * as oidcClient from '@services/oidcClient.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// Middleware to verify OIDC initialization
export const requireOIDC = () => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (!oidcClient.isInitialized()) {
      next(new ApiError('OIDC Client not initialized', StatusCodes.INTERNAL_SERVER_ERROR));
    } else {
      next();
    }
  };
};
