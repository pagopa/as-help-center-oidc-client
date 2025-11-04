import * as healthService from '@services/health.service';
import * as oidcClient from '@services/oidcClient.service';
import { HealthStatus, ServiceStatus } from '@dtos/healthCheck.dto';
import { ApiError } from '@errors/ApiError';

jest.mock('@services/oidcClient.service');

describe('health.service', () => {
  let processUptimeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    processUptimeSpy = jest.spyOn(process, 'uptime').mockReturnValue(123.456);
  });

  afterEach(() => {
    processUptimeSpy.mockRestore();
  });

  describe('healthCheck', () => {
    it('should return healthy status when OIDC is initialized', () => {
      (oidcClient.isInitialized as jest.Mock).mockReturnValue(true);

      const result = healthService.healthCheck();

      expect(oidcClient.isInitialized).toHaveBeenCalled();
      expect(result).toEqual({
        status: HealthStatus.Healthy,
        timestamp: expect.any(String),
        services: {
          oidc: ServiceStatus.Initialized,
        },
        uptime: 123.456,
      });

      expect(process.uptime).toHaveBeenCalled();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should return healthy status with not initialized OIDC', () => {
      (oidcClient.isInitialized as jest.Mock).mockReturnValue(false);

      const result = healthService.healthCheck();

      expect(result).toEqual({
        status: HealthStatus.Healthy,
        timestamp: expect.any(String),
        services: {
          oidc: ServiceStatus.NotInitialized,
        },
        uptime: 123.456,
      });
    });

    it('should check OIDC initialization status', () => {
      (oidcClient.isInitialized as jest.Mock).mockReturnValue(true);

      healthService.healthCheck();

      expect(oidcClient.isInitialized).toHaveBeenCalledTimes(1);
      expect(oidcClient.isInitialized).toHaveBeenCalledWith();
    });

    it('should throw ApiError when oidcClient throws error', () => {
      (oidcClient.isInitialized as jest.Mock).mockImplementation(() => {
        throw new Error('OIDC client error');
      });

      expect(() => healthService.healthCheck()).toThrow(ApiError);
      expect(() => healthService.healthCheck()).toThrow('Unable to get server status');
    });
  });
});
