import '@config/zodExtend';
import express from 'express';
import * as oidcClient from '@services/oidcClient.service';
import routes from './routes';
import { errorHandler } from '@middlewares/errorHandler';
import { notFoundHandler } from '@middlewares/notFoundHandler';
import { securityHeaders } from '@middlewares/securityHeaders';
import { generateCspNonce } from '@middlewares/cspNonce';

const app = express();

// init app (middlewares, routes, OIDC)
export function initializeApp(): void {
  // oidc client
  oidcClient.initializeClient();

  app.use(generateCspNonce);
  // Security headers (including CSP with nonce)
  app.use(securityHeaders);

  // api response type middlewares
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // api routes
  app.use('/', routes);

  // error middlewares
  app.use(notFoundHandler);
  app.use(errorHandler);
}

// initialize the app when module is loaded
initializeApp();

export default app;
