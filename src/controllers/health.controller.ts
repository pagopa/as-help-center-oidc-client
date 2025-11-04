import { HealthCheckResponse, ServiceStatus } from '@dtos/healthCheck.dto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as healthService from '@services/health.service';

export const healthCheck = async (_req: Request, res: Response<HealthCheckResponse>) => {
  const statusRes = healthService.healthCheck();
  const allInitialized = Object.values(statusRes.services).every((status) => status === ServiceStatus.Initialized);
  res.status(allInitialized ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE).json(statusRes);
};
