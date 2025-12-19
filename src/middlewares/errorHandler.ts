import { Request, Response, NextFunction } from 'express';
import env from '@config/env';
import { ApiError } from '@errors/ApiError';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@utils/constants';
import { ZodError } from 'zod';
import { isEmpty } from 'lodash';
import { sanitizeLogMessage } from '@utils/utils';

const printError = (error: unknown, path?: string, envValues: Array<string> = []) => {
  if (isEmpty(envValues) || envValues.includes(env.server.environment)) {
    console.error('Error', error, path ? `Path: ${sanitizeLogMessage(path)}` : '');
  }
};

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  printError(error, req.path);

  let errorResponse: ApiError;
  if (error instanceof ZodError) {
    const errorMessages = error.issues.map((issue: any) => ({
      message: `${issue.path.join('.')} - ${issue.message}`,
    }));
    errorResponse = new ApiError('Invalid data', StatusCodes.BAD_REQUEST, ERROR_CODES.INVALID_DATA);
    errorResponse.setDetails(errorMessages);
  } else if (error instanceof ApiError) {
    errorResponse = error;
  } else {
    errorResponse = new ApiError(
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
    );
  }

  errorResponse.setPath(req.path);

  if (errorResponse.isRedirect === false) {
    res.status(errorResponse.statusCode).json(errorResponse.toJSON());
  } else {
    const redirectUrl = `${env.cac.homeUrl}/error_oid?code=${errorResponse.errorCode || ERROR_CODES.INTERNAL_ERROR}`;
    res.redirect(redirectUrl);
  }
}
