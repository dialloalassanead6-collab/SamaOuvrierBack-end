import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
/**
 * Authorization Middleware Factory
 *
 * RESPONSABILITIES:
 * - Check if authenticated user has required role(s)
 * - Return 403 if user lacks permission
 * - Role is NEVER taken from client (always from verified JWT)
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 *
 * SECURITY:
 * - Depends on req.user being set by authenticate middleware
 * - Never trust client-provided role information
 */
export declare const authorize: (...allowedRoles: Role[]) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authorize.middleware.d.ts.map