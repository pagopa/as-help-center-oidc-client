import config from '@config/env';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

// global registry to collect dtos and routes
export const registry = new OpenAPIRegistry();

// function that generate openapi docs
export const generateSwaggerDocs = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'CAC OIDC client',
      version: `${config.projectVersion}`,
      description: 'OIDC client to handle CAC help center authentication',
    },
    servers: [
      {
        url: config.server.host.includes('localhost') ? `http://localhost:${config.server.port}` : config.server.host,
      },
    ],
  });
};
