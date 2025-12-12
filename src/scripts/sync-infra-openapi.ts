import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Configuration constants
const CONFIG = {
  // Server url
  SERVER_URL: '${server_url}',

  // File paths
  INPUT_OPENAPI_PATH: join(process.cwd(), 'apidocs', 'openapi.json'),
  OUTPUT_PATH: join(process.cwd(), 'infra', 'api', 'cac.tpl.json'),

  // AWS API Gateway integration variables
  LAMBDA_ROLE: '${lambda_apigateway_proxy_role}',
  AWS_REGION: '${aws_region}',
  LAMBDA_ARN: '${cac_lambda_arn}',
} as const;

function safeReadJson(path: string): any | null {
  try {
    if (!existsSync(path)) return null;
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read or parse JSON from ${path}:`, err);
    return null;
  }
}

function buildIntegrationFromResponses(responses: Record<string, any>) {
  const integrationResponses: Record<string, any> = {};

  for (const status of Object.keys(responses || {})) {
    // const resp = responses[status] || {};
    // // Determine content-type for this response
    // let contentType: string | undefined;
    // if (resp.content && typeof resp.content === 'object') {
    //   const contentTypes = Object.keys(resp.content);
    //   if (contentTypes.length > 0) contentType = contentTypes[0];
    // }
    // const responseParameters: Record<string, string> = {};
    // // Add content-type header only if we have a content type
    // if (contentType) {
    //   responseParameters['method.response.header.content-type'] = `'${contentType}'`;
    // }

    // dynamic content-type from integration response header
    integrationResponses[status] = {
      statusCode: String(status),
      // responseParameters: {
      //   'method.response.header.content-type': "'integration.response.header.Content-Type'",
      // },
    };
  }

  return integrationResponses;
}

function attachIntegrationsToPaths(outDoc: any) {
  outDoc.paths = outDoc.paths || {};

  for (const pathKey of Object.keys(outDoc.paths)) {
    const methods = outDoc.paths[pathKey] || {};

    for (const methodKey of Object.keys(methods)) {
      const lcMethod = methodKey.toLowerCase();

      // Only HTTP methods
      if (!['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(lcMethod)) continue;

      const operation = methods[methodKey] as any;

      // Build integration responses from OpenAPI responses
      const openapiResponses = operation.responses || {};
      const integrationResponses = buildIntegrationFromResponses(openapiResponses);

      // Create the integration object
      const integration = {
        credentials: CONFIG.LAMBDA_ROLE,
        passthroughBehavior: 'when_no_match',
        contentHandling: 'CONVERT_TO_TEXT',
        type: 'aws_proxy',
        httpMethod: 'POST',
        uri: `arn:aws:apigateway:${CONFIG.AWS_REGION}:lambda:path/2015-03-31/functions/${CONFIG.LAMBDA_ARN}/invocations`,
        responses: integrationResponses,
      };

      // Attach the integration to the operation
      operation['x-amazon-apigateway-integration'] = integration;
    }
  }
}

function main() {
  // transform the OpenAPI JSON to js object
  const openApiJsonObject = safeReadJson(CONFIG.INPUT_OPENAPI_PATH);
  if (!openApiJsonObject) {
    console.error(`No OpenAPI JSON found in ${CONFIG.INPUT_OPENAPI_PATH}`);
    process.exit(2);
  }

  // Replace server URL with CONFIG value
  openApiJsonObject.servers = openApiJsonObject.servers.map((server: any) => ({
    ...server,
    url: CONFIG.SERVER_URL,
  }));

  // Attach AWS API Gateway integrations to all endpoints
  attachIntegrationsToPaths(openApiJsonObject);

  // Write formatted JSON
  try {
    writeFileSync(CONFIG.OUTPUT_PATH, JSON.stringify(openApiJsonObject, null, 2), 'utf8');
    console.log(`Sync infra OpenAPI completed -> ${CONFIG.OUTPUT_PATH}`);
  } catch (err) {
    console.error('Failed to write output file:', err);
    process.exit(4);
  }
}

if (require.main === module) {
  main();
}
