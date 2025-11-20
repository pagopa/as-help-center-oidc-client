import { generateSwaggerDocs } from '@config/apidocs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

// Configuration constants
const CONFIG = {
  // Server url
  SERVER_URL: '${server_url}',

  // File paths
  COMPILED_INDEX_ROUTES_PATH: join(process.cwd(), 'dist', 'routes', 'index.js'),
  OUTPUT_DIR: 'apidocs',
} as const;

async function main() {
  try {
    // import index routes to ensure all routes are registered
    require(CONFIG.COMPILED_INDEX_ROUTES_PATH);

    const swaggerDocs = generateSwaggerDocs();
    swaggerDocs.servers = [{ url: CONFIG.SERVER_URL }];

    const outYamlPath = join(CONFIG.OUTPUT_DIR, 'openapi.yaml');
    const outJsonPath = join(CONFIG.OUTPUT_DIR, 'openapi.json');

    mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });

    // YAML
    const yamlSpec = stringify(swaggerDocs);
    writeFileSync(outYamlPath, yamlSpec, 'utf8');
    console.log(`OpenAPI YAML written to ${outYamlPath}`);

    // JSON
    const jsonSpec = JSON.stringify(swaggerDocs, null, 2);
    writeFileSync(outJsonPath, jsonSpec, 'utf8');
    console.log(`OpenAPI JSON written to ${outJsonPath}`);
  } catch (err) {
    console.warn('Failed to generate OpenAPI YAML', err);
    process.exit(1);
  }
}

void main();
