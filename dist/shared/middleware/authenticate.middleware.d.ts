import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string;
                email: string;
                role: Role;
                iat?: number;
                exp?: number;
            };
        }
    }
}
/**
 * Authentication Middleware Factory
 *
 * MUST be called with parentheses: authenticate()
 * Returns the middleware function that verifies JWT tokens
 *
 * RESPONSABILITIES:
 * - Verify Bearer token from Authorization header
 * - Validate JWT token
 * - Inject user payload into req.user
 * - Return 401 if token is invalid or missing
 *
 * SECURITY:
 * - Never trust client-provided role (always from token)
 * - Verify token on every protected route
 */
export declare const authenticate: () => ((req: Request, res: Response, next: NextFunction) => Promise<void>);
//# sourceMappingURL=authenticate.middleware.d.ts.map