import { Router } from 'express';
import * as healthController from '@controllers/health.controller';

const router = Router();
const prefix = '/health';

router.get('', healthController.healthCheck);

export default { router, prefix };
