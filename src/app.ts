import express from 'express';
import config from '@config/env';
import * as oidcClient from '@services/oidcClient.service';
import routes from './routes';
import { errorHandler } from '@middlewares/errorHandler';
import { notFoundHandler } from '@middlewares/notFoundHandler';

const app = express();

// Startup
function startServer(): void {
  try {
    // OIDC client initialization
    oidcClient.getClientOrInitialize();

    // Middlewares
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // api routes
    app.use('/', routes);

    // middlewares
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    app.listen(config.server.port, () => {
      console.log(`Server running on ${config.server.host}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
