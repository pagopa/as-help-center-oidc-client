import { Request, Response, NextFunction } from 'express';
import { notFoundHandler } from '@middlewares/notFoundHandler';
import { ApiError } from '@errors/ApiError';
import { StatusCodes } from 'http-status-codes';

describe('notFoundHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = { originalUrl: '/non-existent-route' };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create ApiError with "Route not found" message and NOT_FOUND status code', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));

    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Route not found: /non-existent-route');
    expect(error.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(error.statusCode).toBe(404);
  });

  it('should not call response methods', () => {
    mockResponse.status = jest.fn().mockReturnThis();
    mockResponse.json = jest.fn();
    mockResponse.send = jest.fn();

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });

  it('should create consistent error for all requests', () => {
    const mockNext1 = jest.fn();
    const mockNext2 = jest.fn();

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext1);
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext2);

    const error1 = mockNext1.mock.calls[0][0];
    const error2 = mockNext2.mock.calls[0][0];

    expect(error1.message).toBe(error2.message);
    expect(error1.statusCode).toBe(error2.statusCode);
  });
});
