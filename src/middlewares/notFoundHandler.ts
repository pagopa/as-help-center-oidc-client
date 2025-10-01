import { ApiError } from '@errors/ApiError';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// Route not found - 404 handler middleware
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError('Route not found', StatusCodes.NOT_FOUND));
}
