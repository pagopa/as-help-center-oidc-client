
import express, { Request, Response } from 'express';
import * as oidcClient from '@services/oidcClient.service';

const healthRouter = express.Router();

healthRouter.get('', (_req: Request, res: Response) => {
  try {
    const oidcIsInitialized = oidcClient.isInitialized();
    const statusRes = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        oidc: oidcIsInitialized ? 'initialized' : 'not initialized'
      },
      uptime: process.uptime()
    };

    res.status(oidcIsInitialized ? 200 : 503).json(statusRes);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Unable to get server status',
      timestamp: new Date().toISOString()
    });
  }
});

export default healthRouter;