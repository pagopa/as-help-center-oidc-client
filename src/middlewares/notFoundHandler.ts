import { NextFunction, Request, Response } from 'express';

// 404 handler middleware
// TODO refactor with res.redirect -> not found page
export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ error: 'Service not found' });
}
