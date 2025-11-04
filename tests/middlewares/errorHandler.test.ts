import { ZodError } from 'zod';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { errorHandler } from '@middlewares/errorHandler';
import { ApiError } from '@errors/ApiError';

describe('Error handler middleware', () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = { originalUrl: '/test-route' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('Manage ZOD validation error', () => {
    const zodError = new ZodError([{ path: ['field1'], message: 'Required field', code: 'custom' }]);

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid data',
      path: '/test-route',
      details: [{ message: 'field1 - Required field' }],
      timestamp: expect.any(String),
    });
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
    expect(res.json).toHaveBeenCalledWith({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      path: '/test-route',
      timestamp: expect.any(String),
    });
  });
});
