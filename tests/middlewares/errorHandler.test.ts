import { ZodError } from 'zod';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { ApiError } from '@errors/ApiError';
import { ERROR_CODES } from '@utils/constants';

process.env.ERROR_JSON = 'true';
import { errorHandler } from '@middlewares/errorHandler';

describe('Error handler middleware', () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = { originalUrl: '/test-route' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  it('Manage ZOD validation error', () => {
    const zodError = new ZodError([{ path: ['field1'], message: 'Required field', code: 'custom' }]);

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid data',
        path: '/test-route',
        timestamp: expect.any(String),
      }),
    );

    const sent = (res.json as jest.Mock).mock.calls[0][0];
    expect(sent.details).toEqual([{ message: 'field1 - Required field' }]);
    expect(sent.errorCode).toBeDefined();
  });

  it('Manage ApiError error', () => {
    const apiError = new ApiError('Resource not found', StatusCodes.NOT_FOUND);

    errorHandler(apiError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Resource not found',
      path: '/test-route',
      timestamp: expect.any(String),
    });
  });

  it('Manage generic error', () => {
    const genericError = new Error('Generic error');

    errorHandler(genericError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        path: '/test-route',
        timestamp: expect.any(String),
      }),
    );

    const sent = (res.json as jest.Mock).mock.calls[0][0];
    expect(sent.errorCode).toEqual(ERROR_CODES.INTERNAL_ERROR);
  });

  it('Redirects to error page when errorJson is false', () => {
    jest.resetModules();
    process.env.ERROR_JSON = 'false';

    const { errorHandler: errorHandlerRedirect } = require('@middlewares/errorHandler');

    const apiError = new ApiError('Resource not found', StatusCodes.NOT_FOUND, '99');
    const req2 = { originalUrl: '/test-route' };
    const res2 = { redirect: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    errorHandlerRedirect(apiError, req2, res2, jest.fn());

    expect(res2.redirect).toHaveBeenCalled();
    const redirectUrl = (res2.redirect as jest.Mock).mock.calls[0][0] as string;
    expect(redirectUrl.startsWith('https://centroassistenza.pagopa.it/hc/it/error_oid?code=')).toBe(true);
    const code = redirectUrl.split('=')[1];
    expect([apiError.errorCode, ERROR_CODES.INTERNAL_ERROR]).toContain(code);
    // restore environment
    delete process.env.ERROR_JSON;
  });
});
