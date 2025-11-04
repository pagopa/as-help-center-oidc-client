import { Request, Response, NextFunction } from 'express';
import { requireOIDC } from '@middlewares/requireOIDC';
import * as oidcClient from '@services/oidcClient.service';
import { ApiError } from '@errors/ApiError';
import { StatusCodes } from 'http-status-codes';

jest.mock('@services/oidcClient.service');

describe('requireOIDC', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let middleware: ReturnType<typeof requireOIDC>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
    middleware = requireOIDC();
  });

  it('should call next without error when OIDC is initialized', () => {
    (oidcClient.isInitialized as jest.Mock).mockReturnValue(true);

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(oidcClient.isInitialized).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next with ApiError when OIDC is not initialized', () => {
    (oidcClient.isInitialized as jest.Mock).mockReturnValue(false);

    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(oidcClient.isInitialized).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(2);
    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));

    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('OIDC Client not initialized');
    expect(error.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(error.statusCode).toBe(500);
  });

  it('should check OIDC initialization on every request', () => {
    (oidcClient.isInitialized as jest.Mock).mockReturnValue(true);

    middleware(mockRequest as Request, mockResponse as Response, mockNext);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);
    middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(oidcClient.isInitialized).toHaveBeenCalledTimes(3);
  });

  it('should create new middleware instance on each call to requireOIDC', () => {
    const middleware1 = requireOIDC();
    const middleware2 = requireOIDC();

    expect(middleware1).not.toBe(middleware2);
  });

  it('should handle transition from uninitialized to initialized', () => {
    (oidcClient.isInitialized as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(true);

    const mockNext1 = jest.fn();
    const mockNext2 = jest.fn();

    middleware(mockRequest as Request, mockResponse as Response, mockNext1);
    expect(mockNext1).toHaveBeenCalledWith(expect.any(ApiError));

    middleware(mockRequest as Request, mockResponse as Response, mockNext2);
    expect(mockNext2).toHaveBeenCalledWith();
  });
});
