/**
 * Validation Middleware
 * Uses Zod to validate request data
 */
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodIssue } from 'zod';
import { ZodError } from 'zod';

/**
 * Creates a validation middleware for the given Zod schema
 * @param schema - The Zod schema to validate against
 * @param location - Where to validate: 'body' | 'query' | 'params'
 */
export function validateRequest(schema: ZodSchema, location: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[location];
      schema.parse(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: { field: string; message: string }[] = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}
