import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Generates a per-request nonce for CSP.
 * The nonce is stored in res.locals.cspNonce for use in security headers.
 */
export function generateCspNonce(_req: Request, res: Response, next: NextFunction) {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
}
