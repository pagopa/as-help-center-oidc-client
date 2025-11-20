import { Router } from 'express';
import * as healthController from '@controllers/health.controller';
import { registerRoute } from '@utils/openapi';
import { StatusCodes } from 'http-status-codes';
import { healthCheckResponseSchema } from '@dtos/healthCheck.dto';

const router = Router();
const prefix = '/health';
const tag = 'Health';

router.get('', healthController.healthCheck);
registerRoute({
  method: 'get',
  path: `${prefix}`,
  summary: 'Perform health check of the service',
  tags: [tag],
  responses: {
    [StatusCodes.OK]: {
      description: 'Service is healthy',
      schema: healthCheckResponseSchema,
    },
    [StatusCodes.SERVICE_UNAVAILABLE]: {
      description: 'Service is unhealthy',
      schema: healthCheckResponseSchema,
    },
  },
});

export default { router, prefix };
