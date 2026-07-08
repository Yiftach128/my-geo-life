import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../errors/index.js';

/**
 * Query-string sibling of `validateBody`. Parses `req.query` with Zod (Express 5
 * makes `req.query` a read-only getter, so we never reassign it) and attaches the
 * validated, coerced result to the shared `req.dto` slot. On failure it throws a
 * ValidationError that the central error handler turns into a 400.
 *
 * Query params are primitives, so — unlike `validateBody` — there is no DTO class
 * to construct; the plain parsed object is handed straight to the controller.
 */
export const validateQuery =
  <TSchema extends ZodType>(schema: TSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.map(String).join('.') || '(query)',
        message: issue.message,
      }));
      throw new ValidationError(details);
    }

    req.dto = result.data;
    next();
  };
