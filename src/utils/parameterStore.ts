import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { isEmpty } from 'lodash';

const client = new SSMClient({
  region: process.env.AWS_REGION || 'eu-south-1',
});
let loaded = false;

type ParametersMap = Record<string, string>;

const fetchAllParametersByPath = async (parameterPath: string): Promise<ParametersMap> => {
  const parameters: ParametersMap = {};
  let nextPaginationToken: string | undefined;

  do {
    const command = new GetParametersByPathCommand({
      Path: parameterPath,
      Recursive: true,
      WithDecryption: true, // Decrypt SecureString parameters
      NextToken: nextPaginationToken,
    });
    const response = await client.send(command);

    if (response.Parameters) {
      for (const param of response.Parameters) {
        if (param.Name && param.Value) {
          // remove path prefix (/cac-oidc-client/AUTH_JWT_SECRET -> AUTH_JWT_SECRET)
          const paramName = param.Name.replace(`${parameterPath}/`, '');
          parameters[paramName] = param.Value;
        }
      }
    }

    nextPaginationToken = response.NextToken;
  } while (nextPaginationToken);

  return parameters;
};

const populateEnvVariables = (parameters: ParametersMap): void => {
  if (!isEmpty(parameters)) {
    for (const [key, value] of Object.entries(parameters)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } else {
    throw new Error(`[ParameterStore] No parameters found`);
  }
};

// Load env variables from AWS Parameter Store (under a given path prefix) into process.env
export async function loadParametersIntoEnv(): Promise<void> {
  if (loaded) return;

  const parameterPath = process.env.PARAMETER_STORE_PATH;

  try {
    console.info(`[ParameterStore] Loading from path: ${parameterPath}`);

    if (!parameterPath) {
      throw new Error('PARAMETER_STORE_PATH is required');
    }

    const parameters = await fetchAllParametersByPath(parameterPath);
    populateEnvVariables(parameters);

    console.info(`[ParameterStore] Loaded ${Object.keys(parameters).length} parameters`);
    loaded = true;
  } catch (err) {
    console.error('[ParameterStore] Failed to load parameters', err);
    throw err;
  }
}
