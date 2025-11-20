import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '@errors/ApiError';

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

  it('Manage ZOD validation error - redirects by default', () => {
    const zodError = new ZodError([{ path: ['field1'], message: 'Required field', code: 'custom' }]);

    errorHandler(zodError, req, res, next);

    expect(res.redirect).toHaveBeenCalled();
    const redirectUrl = (res.redirect as jest.Mock).mock.calls[0][0] as string;
    expect(redirectUrl.startsWith('https://centroassistenza.pagopa.it/hc/it/error_oid?code=')).toBe(true);
  });

  it('Manage ApiError error - redirects by default', () => {
    const apiError = new ApiError('Resource not found', StatusCodes.NOT_FOUND);

    errorHandler(apiError, req, res, next);

    expect(res.redirect).toHaveBeenCalled();
    const redirectUrl = (res.redirect as jest.Mock).mock.calls[0][0] as string;
    expect(redirectUrl.startsWith('https://centroassistenza.pagopa.it/hc/it/error_oid?code=')).toBe(true);
  });

  it('Manage ApiError error - returns JSON when isRedirect is false', () => {
    const apiError = new ApiError('Resource not found', StatusCodes.NOT_FOUND);
    apiError.setIsRedirect(false);

    errorHandler(apiError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Resource not found',
      path: '/test-route',
      timestamp: expect.any(String),
    });
  });

  it('Manage generic error - redirects by default', () => {
    const genericError = new Error('Generic error');

    errorHandler(genericError, req, res, next);

    expect(res.redirect).toHaveBeenCalled();
    const redirectUrl = (res.redirect as jest.Mock).mock.calls[0][0] as string;
    expect(redirectUrl.startsWith('https://centroassistenza.pagopa.it/hc/it/error_oid?code=')).toBe(true);
  });

  it('Redirects to error page with correct error code', () => {
    const apiError = new ApiError('Resource not found', StatusCodes.NOT_FOUND, '99');

    errorHandler(apiError, req, res, next);

    expect(res.redirect).toHaveBeenCalled();
    const redirectUrl = (res.redirect as jest.Mock).mock.calls[0][0] as string;
    expect(redirectUrl).toBe('https://centroassistenza.pagopa.it/hc/it/error_oid?code=99');
  });
});
