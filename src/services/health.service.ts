import { HealthCheckResponse, HealthStatus, ServiceStatus } from '@dtos/healthCheck.dto';
import { ApiError } from '@errors/ApiError';
import * as oidcClient from '@services/oidcClient.service';
import { StatusCodes } from 'http-status-codes';

export const healthCheck = (): HealthCheckResponse => {
  try {
    const oidcIsInitialized = oidcClient.isInitialized();
    return {
      status: HealthStatus.Healthy,
      timestamp: new Date().toISOString(),
      services: {
        oidc: oidcIsInitialized ? ServiceStatus.Initialized : ServiceStatus.NotInitialized,
      },
      uptime: process.uptime(),
    };
  } catch (error: unknown) {
    console.error('Health check error:', error);
    const apiError = new ApiError('Unable to get server status', StatusCodes.SERVICE_UNAVAILABLE);
    apiError.setIsRedirect(false);
    throw apiError;
  }
};
