import { HealthCheckResponse, HealthStatus, ServiceStatus } from '@dtos/healthCheck.dto';
import { ApiError } from '@errors/ApiError';
import * as oidcClient from '@services/oidcClient.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const healthCheck = async (_req: Request, res: Response<HealthCheckResponse>) => {
  try {
    const oidcIsInitialized = oidcClient.isInitialized();
    const statusRes = {
      status: HealthStatus.Healthy,
      timestamp: new Date().toISOString(),
      services: {
        oidc: oidcIsInitialized ? ServiceStatus.Initialized : ServiceStatus.NotInitialized,
      },
      uptime: process.uptime(),
    };

    res.status(oidcIsInitialized ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE).json(statusRes);
  } catch (error: unknown) {
    console.error('Health check error:', error);
    throw new ApiError('Unable to get server status', StatusCodes.SERVICE_UNAVAILABLE);
  }
};
