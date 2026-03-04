/**
 * Validation Middleware
 * Uses Zod to validate request data
 */
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
/**
 * Creates a validation middleware for the given Zod schema
 * @param schema - The Zod schema to validate against
 * @param location - Where to validate: 'body' | 'query' | 'params'
 */
export declare function validateRequest(schema: ZodSchema, location?: 'body' | 'query' | 'params'): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate-request.middleware.d.ts.map