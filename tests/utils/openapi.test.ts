import { z } from '@config/zodExtend';
import { registry } from '@config/apidocs';
import { registerRoute } from '@utils/openapi';
import { StatusCodes } from 'http-status-codes';

jest.mock('@config/apidocs', () => ({
  registry: { registerPath: jest.fn() },
}));

jest.mock('@dtos/error.dto', () => ({
  errorResponseSchema: {},
}));

describe('registerRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly register a route with request body and responses', () => {
    const exampleSchema = z.object({ name: z.string() });
    const exampleResSchema = z.object({ id: z.string().uuid() });

    registerRoute({
      method: 'post',
      path: '/users',
      summary: 'Create a new user',
      requestBody: { schema: exampleSchema },
      responses: {
        201: { description: 'User created successfully', schema: exampleResSchema },
      },
      tags: ['Users'],
    });

    expect(registry.registerPath).toHaveBeenCalledTimes(1);
    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.method).toBe('post');
    expect(callArg.path).toBe('/users');
    expect(callArg.summary).toBe('Create a new user');
    expect(callArg.tags).toEqual(['Users']);
    expect(callArg.request.body).toBeDefined();
    expect(callArg.request.body.description).toBe('Request body');
    expect(callArg.request.body.content['application/json'].schema).toBe(exampleSchema);
    expect(callArg.responses[201]).toBeDefined();
    expect(callArg.responses[201].description).toBe('User created successfully');
    expect(callArg.responses[201].content['application/json'].schema).toBe(exampleResSchema);
  });

  it('should correctly register a route with path and query parameters', () => {
    const pathParams = z.object({ userId: z.string().uuid() });
    const queryParams = z.object({ sortBy: z.enum(['date', 'likes']).optional() });

    registerRoute({
      method: 'get',
      path: '/users/{userId}/posts',
      summary: 'Get posts of a user with sorting options',
      pathParams,
      queryParams,
      responses: { 200: { description: 'User posts retrieved' } },
      tags: ['Posts'],
    });

    expect(registry.registerPath).toHaveBeenCalledTimes(1);
    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.method).toBe('get');
    expect(callArg.path).toBe('/users/{userId}/posts');
    expect(callArg.request.params).toBe(pathParams);
    expect(callArg.request.query).toBe(queryParams);
  });

  it('should include default error responses when errorsRedirect is false', () => {
    registerRoute({
      method: 'get',
      path: '/test',
      summary: 'Test route',
      responses: { 200: { description: 'OK' } },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    // Should include default error responses
    expect(callArg.responses[StatusCodes.BAD_REQUEST]).toBeDefined();
    expect(callArg.responses[StatusCodes.UNAUTHORIZED]).toBeDefined();
    expect(callArg.responses[StatusCodes.FORBIDDEN]).toBeDefined();
    expect(callArg.responses[StatusCodes.NOT_FOUND]).toBeDefined();
    expect(callArg.responses[StatusCodes.INTERNAL_SERVER_ERROR]).toBeDefined();
  });

  it('should exclude default error responses when errorsRedirect is true', () => {
    registerRoute({
      method: 'get',
      path: '/redirect-test',
      summary: 'Test redirect route',
      responses: { 302: { description: 'Redirect' } },
      errorsRedirect: true,
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    // Should NOT include default error responses
    expect(callArg.responses[StatusCodes.BAD_REQUEST]).toBeUndefined();
    expect(callArg.responses[StatusCodes.UNAUTHORIZED]).toBeUndefined();
    expect(callArg.responses[StatusCodes.FORBIDDEN]).toBeUndefined();
    expect(callArg.responses[StatusCodes.NOT_FOUND]).toBeUndefined();
    expect(callArg.responses[StatusCodes.INTERNAL_SERVER_ERROR]).toBeUndefined();
    // Should only have custom response
    expect(callArg.responses[302]).toBeDefined();
  });

  it('should register a route without request body, params or query', () => {
    registerRoute({
      method: 'get',
      path: '/health',
      summary: 'Health check',
      responses: { 200: { description: 'OK' } },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.request.body).toBeUndefined();
    expect(callArg.request.params).toBeUndefined();
    expect(callArg.request.query).toBeUndefined();
  });

  it('should handle response without schema (no content)', () => {
    registerRoute({
      method: 'delete',
      path: '/items/{id}',
      summary: 'Delete item',
      responses: { 204: { description: 'No content' } },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.responses[204]).toBeDefined();
    expect(callArg.responses[204].description).toBe('No content');
    expect(callArg.responses[204].content).toBeUndefined();
  });

  it('should support custom content type for request body', () => {
    const schema = z.object({ data: z.string() });

    registerRoute({
      method: 'post',
      path: '/upload',
      summary: 'Upload file',
      requestBody: {
        schema,
        content: 'multipart/form-data',
        description: 'File upload payload',
      },
      responses: { 201: { description: 'Created' } },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.request.body.content['multipart/form-data']).toBeDefined();
    expect(callArg.request.body.content['multipart/form-data'].schema).toBe(schema);
    expect(callArg.request.body.description).toBe('File upload payload');
  });

  it('should support custom content type for response', () => {
    const schema = z.object({ result: z.string() });

    registerRoute({
      method: 'get',
      path: '/data',
      summary: 'Get data',
      responses: {
        200: {
          description: 'OK',
          schema,
          content: 'application/xml',
        },
      },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.responses[200].content['application/xml']).toBeDefined();
    expect(callArg.responses[200].content['application/xml'].schema).toBe(schema);
  });

  it('should support response headers', () => {
    const headersSchema = z.object({
      'X-Rate-Limit': z.string(),
      'X-Total-Count': z.string(),
    });

    registerRoute({
      method: 'get',
      path: '/items',
      summary: 'List items',
      responses: {
        200: {
          description: 'OK',
          headers: headersSchema,
        },
      },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.responses[200].headers).toBe(headersSchema);
  });

  it('should use default description for request body if not provided', () => {
    const schema = z.object({ name: z.string() });

    registerRoute({
      method: 'post',
      path: '/test',
      summary: 'Test',
      requestBody: { schema },
      responses: { 200: { description: 'OK' } },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.request.body.description).toBe('Request body');
  });

  it('should use default description for response if not provided', () => {
    const schema = z.object({ id: z.string() });

    registerRoute({
      method: 'get',
      path: '/test',
      summary: 'Test',
      responses: { 200: { schema } },
    });

    const callArg = (registry.registerPath as jest.Mock).mock.calls[0][0];

    expect(callArg.responses[200].description).toBe('Response schema');
  });
});
