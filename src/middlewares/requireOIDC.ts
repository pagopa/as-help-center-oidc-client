import { oidcClient } from '@routes/auth.route';
import { NextFunction, Request, Response } from 'express';

// Middleware per verificare inizializzazione OIDC
export const requireOIDC = () => {
  return (_req: Request, res: Response, next: NextFunction) => {
    console.log('requireOIDC middleware ..');
    if (!oidcClient.isInitialized()) {
      // TODO: next(new ApiError('Access denied', StatusCodes.FORBIDDEN, AUTH_ERROR.ACCESS_DENIED));
      res.status(500).json({ error: 'OIDC Client not initialized' });
    }
    next();
  };
};
