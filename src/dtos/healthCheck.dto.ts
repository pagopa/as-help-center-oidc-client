export enum HealthStatus {
  Healthy = 'healthy',
  Unhealthy = 'unhealthy',
}

export enum ServiceStatus {
  Initialized = 'initialized',
  NotInitialized = 'not initialized',
}

export type HealthCheckResponse = {
  status: HealthStatus;
  timestamp: string; // ISO string
  services: {
    oidc: ServiceStatus;
  };
  uptime: number; // seconds
};
