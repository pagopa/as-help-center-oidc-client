import express from 'express';
import config from '@config/env';
import * as oidcClient from '@services/oidcClient.service';
import { authRouter } from '@routes/auth.route';
import healthRouter from '@routes/health.route';
import { errorHandler } from '@middlewares/errorHandler';
import { notFoundHandler } from '@middlewares/notFoundHandler';

const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/auth', authRouter);
// Health checks
app.use('/health', healthRouter);

// middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Startup
function startServer(): void {
  try {
    // OIDC client initialization
    oidcClient.getClientOrInitialize();

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
