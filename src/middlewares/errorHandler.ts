// Error handler middleware
import { Request, Response, NextFunction } from 'express';
import config from '@config/env';

// TODO refactor
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: config.server.environment === 'development' && error instanceof Error
      ? error.message
      : undefined
  });
}