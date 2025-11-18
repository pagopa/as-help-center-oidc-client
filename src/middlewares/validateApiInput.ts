import { Request, Response, NextFunction } from 'express-serve-static-core';
import { ZodType } from 'zod';

// middleware for input validation (body, path param, query param)
export function validate(schemas: { body?: ZodType<any>; query?: ZodType<any>; params?: ZodType<any> }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // validate and overwrite body with validated data
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) {
        const validatedQuery = schemas.query.parse(req.query);
        updateTargetWithValidatedData(req, 'query', validatedQuery);
      }
      if (schemas.params) {
        const validatedParams = schemas.params.parse(req.params);
        updateTargetWithValidatedData(req, 'params', validatedParams);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

// for req.query and params immutability in Express 5
const updateTargetWithValidatedData = (req: Request, target: 'params' | 'query' | 'body', validatedData: any) => {
  Object.defineProperty(req, target, {
    value: validatedData,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};
