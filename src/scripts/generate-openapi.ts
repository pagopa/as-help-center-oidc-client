import { generateSwaggerDocs } from '@config/apidocs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { stringify } from 'yaml';

async function main() {
  try {
    const compiledRoutesDir = join(process.cwd(), 'dist', 'routes');

    try {
      require(join(compiledRoutesDir, 'index.js'));
    } catch {
      // ignore if index.js not found
    }

    const swaggerDocs = generateSwaggerDocs();
    swaggerDocs.servers = [{ url: '{{server}}' }];

    const outDir = 'apidocs';
    const outYamlPath = join(outDir, 'openapi.yaml');
    const outJsonPath = join(outDir, 'openapi.json');

    mkdirSync(outDir, { recursive: true });

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
