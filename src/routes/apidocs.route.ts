import { generateSwaggerDocs } from '@config/apidocs';
import { Router } from 'express';
import { Request, Response } from 'express-serve-static-core';
import swaggerUi from 'swagger-ui-express';
import { stringify } from 'yaml';

const prefix = '/api-docs';
const router = Router();

const swaggerDocs = generateSwaggerDocs();

// json open api documentation
router.get('/', (_req: Request, res: Response) => {
  res.json(swaggerDocs);
});

// yaml open api documentation
router.get('/openapi.yaml', (_req: Request, res: Response) => {
  const yamlSpec = stringify(swaggerDocs);
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(yamlSpec);
});

// swagger ui
router.use('/ui', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default { router, prefix };
