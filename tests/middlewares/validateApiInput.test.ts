import { validate } from '@middlewares/validateApiInput';
import { Request, Response } from 'express';
import { ZodError, z } from 'zod';

describe('Input validate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {};
    next = jest.fn();
  });

  const bodySchema = z.object({
    name: z.string().min(3, { message: 'Name min length is 3 char' }),
    age: z.number().positive({ message: 'Age must be positive number' }),
  });

  const querySchema = z.object({
    search: z.string({ message: 'Search param must be a string' }),
  });

  const paramsSchema = z.object({
    id: z.string().uuid({ message: 'Id must be a valid UUID' }),
  });

  it('Valid data - next()', () => {
    req.body = { name: 'Alice', age: 25 };
    req.query = { search: 'test' };
    req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

    const middleware = validate({ body: bodySchema, query: querySchema, params: paramsSchema });
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // No error passed to next()
  });

  it('Invalid body data - next(error)', () => {
    req.body = { name: 'Al', age: -5 }; // short name, negative age

    const middleware = validate({ body: bodySchema });
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const zerror = next.mock.calls[0][0];
    expect(zerror).toBeInstanceOf(ZodError);
    expect(zerror.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Name min length is 3 char',
          path: ['name'],
        }),
      ]),
    );
  });

  it('Invalid query param data - next(error)', () => {
    req.query = { search: 123 as unknown as string }; // search must be a string

    const middleware = validate({ query: querySchema });
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const zerror = next.mock.calls[0][0];
    expect(zerror).toBeInstanceOf(ZodError);
    expect(zerror.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Search param must be a string',
          path: ['search'],
        }),
      ]),
    );
  });

  it('Invalid path param data - next(error)', () => {
    req.params = { id: 'not-a-valid-uuid' }; // ID is not a valid UUID

    const middleware = validate({ params: paramsSchema });
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const zerror = next.mock.calls[0][0];
    expect(zerror).toBeInstanceOf(ZodError);
    expect(zerror.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Id must be a valid UUID',
          path: ['id'],
        }),
      ]),
    );
  });
});
