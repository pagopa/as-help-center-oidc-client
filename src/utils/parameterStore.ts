import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { isEmpty } from 'lodash';

const client = new SSMClient({
  region: process.env.AWS_REGION || 'eu-south-1',
});
let loaded = false;

type ParametersMap = Record<string, string>;

const fetchAllParametersByPath = async (parameterPath: string): Promise<ParametersMap> => {
  const parameters: ParametersMap = {};

  // Normalize path: ensure it starts with / and doesn't end with /
  const normalizedPath = (parameterPath.startsWith('/') ? parameterPath : `/${parameterPath}`).replace(/\/$/, '');

  let nextPaginationToken: string | undefined;

  do {
    const command = new GetParametersByPathCommand({
      Path: normalizedPath,
      Recursive: true,
      WithDecryption: true, // Decrypt SecureString parameters
      NextToken: nextPaginationToken,
    });
    const response = await client.send(command);

    if (response.Parameters) {
      for (const param of response.Parameters) {
        if (param.Name && param.Value) {
          // remove path prefix (/cac-oidc-client/AUTH_JWT_SECRET -> AUTH_JWT_SECRET)
          const paramName = param.Name.replace(`${normalizedPath}/`, '');
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
    if (!parameterPath) {
      throw new Error('PARAMETER_STORE_PATH is required');
    }

    const parameters = await fetchAllParametersByPath(parameterPath);
    populateEnvVariables(parameters);

    console.info(
      { parameterCount: Object.keys(parameters).length, parameterPath },
      'Parameters loaded from Parameter Store',
    );
    loaded = true;
  } catch (err) {
    console.error({ err, parameterPath }, 'Failed to load parameters from Parameter Store');
    throw err;
  }
}
