import { Request, Response } from 'express';
import { healthCheck } from '@controllers/health.controller';
import * as healthService from '@services/health.service';
import { HealthStatus, ServiceStatus } from '@dtos/healthCheck.dto';
import { StatusCodes } from 'http-status-codes';

jest.mock('@services/health.service');

describe('health.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('healthCheck', () => {
    it('should call health service and return OK status when all services are initialized', async () => {
      const mockHealthResponse = {
        status: HealthStatus.Healthy,
        timestamp: '2021-01-01T00:00:00.000Z',
        services: {
          oidc: ServiceStatus.Initialized,
        },
        uptime: 12345.67,
      };

      (healthService.healthCheck as jest.Mock).mockReturnValue(mockHealthResponse);

      await healthCheck(mockRequest as Request, mockResponse as Response);

      expect(healthService.healthCheck).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockHealthResponse);
    });

    it('should return SERVICE_UNAVAILABLE status when any service is not initialized', async () => {
      const mockHealthResponse = {
        status: HealthStatus.Healthy,
        timestamp: '2021-01-01T00:00:00.000Z',
        services: {
          oidc: ServiceStatus.NotInitialized,
        },
        uptime: 12345.67,
      };

      (healthService.healthCheck as jest.Mock).mockReturnValue(mockHealthResponse);

      await healthCheck(mockRequest as Request, mockResponse as Response);

      expect(healthService.healthCheck).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.SERVICE_UNAVAILABLE);
      expect(mockResponse.json).toHaveBeenCalledWith(mockHealthResponse);
    });
  });
});
