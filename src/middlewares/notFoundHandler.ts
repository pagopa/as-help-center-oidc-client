import { ApiError } from '@errors/ApiError';
import { ERROR_CODES } from '@utils/constants';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// Route not found - 404 handler middleware
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new ApiError('Route not found: ' + req.originalUrl, StatusCodes.NOT_FOUND, ERROR_CODES.NOT_FOUND_ERROR));
}
