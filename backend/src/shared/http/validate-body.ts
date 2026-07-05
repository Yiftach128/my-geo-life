import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z, ZodType } from 'zod';
import { ValidationError } from '../errors/index.js';

/**
 * Translates an HTTP request body into a typed DTO instance, performing
 * input/format validation with Zod during the translation. On success it
 * attaches the constructed DTO to `req.dto`; on failure it throws a
 * ValidationError that the central error handler turns into a 400.
 *
 * Business-rule validation (uniqueness, existence, etc.) is NOT done here — it
 * lives in the service layer.
 */
export const validateBody =
  <TSchema extends ZodType, TDto>(
    schema: TSchema,
    DtoClass: new (data: z.infer<TSchema>) => TDto,
  ): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.map(String).join('.') || '(body)',
        message: issue.message,
      }));
      throw new ValidationError(details);
    }

    req.dto = new DtoClass(result.data);
    next();
  };
