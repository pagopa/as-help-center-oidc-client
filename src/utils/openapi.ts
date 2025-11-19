import { registry } from '@config/apidocs';
import { StatusCodes } from 'http-status-codes';
import { z } from '@config/zodExtend';
import { errorResponseSchema } from '@dtos/error.dto';

const applicationJsonContentType = 'application/json';

interface OpenApiResponseConfig {
  description?: string;
  schema?: z.ZodType<any>;
  headers?: z.ZodObject<any>;
  content?: string;
}
type OpenApiResponses = Record<number, OpenApiResponseConfig>;

const defaultErrorResponses = {
  [StatusCodes.BAD_REQUEST]: {
    description: 'Bad request - invalid data |',
    content: { [applicationJsonContentType]: { schema: errorResponseSchema } },
  },
  [StatusCodes.UNAUTHORIZED]: {
    description: 'Unauthorized - authentication required or invalid credentials',
    content: { [applicationJsonContentType]: { schema: errorResponseSchema } },
  },
  [StatusCodes.FORBIDDEN]: {
    description: 'Forbidden - permission denied to perform the request',
    content: { [applicationJsonContentType]: { schema: errorResponseSchema } },
  },
  [StatusCodes.NOT_FOUND]: {
    description: 'Resource not found',
    content: { [applicationJsonContentType]: { schema: errorResponseSchema } },
  },
  [StatusCodes.INTERNAL_SERVER_ERROR]: {
    description: 'Generic error',
    content: { [applicationJsonContentType]: { schema: errorResponseSchema } },
  },
};

const buildResponses = (responses: OpenApiResponses, errorsRedirect: boolean) => {
  const customResponses: any = {};

  for (const statusCode in responses) {
    const status = Number(statusCode);
    const response = responses[status];

    customResponses[status] = {
      description: response.description || 'Response schema',
      // add response schema only it it exists
      ...(response.schema
        ? { content: { [response.content || applicationJsonContentType]: { schema: response.schema } } }
        : {}),
      // add response headers only it they exist
      ...(response.headers ? { headers: response.headers } : {}), // add headers only if they exists
    };
  }

  return {
    ...customResponses,
    ...(errorsRedirect ? {} : defaultErrorResponses),
  };
};

export const registerRoute = ({
  method,
  path,
  summary,
  requestBody,
  pathParams,
  queryParams,
  responses,
  tags,
  errorsRedirect = false,
}: {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  summary: string;
  requestBody?: { description?: string; content?: string; schema: z.ZodType<any> };
  pathParams?: z.ZodObject<any>;
  queryParams?: z.ZodObject<any>;
  responses: OpenApiResponses;
  tags?: string[];
  errorsRedirect?: boolean;
}) => {
  registry.registerPath({
    method,
    path,
    tags,
    summary,
    request: {
      // add request body only if it exists
      ...(requestBody
        ? {
            body: {
              description: requestBody.description || 'Request body',
              content: {
                [requestBody.content || applicationJsonContentType]: { schema: requestBody.schema },
              },
            },
          }
        : {}),
      // add path params only if they exist
      ...(pathParams ? { params: pathParams } : {}),
      // add query param only if they exist
      ...(queryParams ? { query: queryParams } : {}),
    },
    responses: buildResponses(responses, errorsRedirect),
  });
};
