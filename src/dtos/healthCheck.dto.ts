import { z } from '@config/zodExtend';

export enum HealthStatus {
  Healthy = 'healthy',
  Unhealthy = 'unhealthy',
}

export enum ServiceStatus {
  Initialized = 'initialized',
  NotInitialized = 'not initialized',
}

export const healthCheckResponseSchema = z
  .object({
    status: z.enum(HealthStatus),
    timestamp: z.string(), // ISO string
    services: z.object({
      oidc: z.enum(ServiceStatus),
    }),
    uptime: z.number(), // seconds
  })
  .openapi('HealthCheckResponse');

export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
