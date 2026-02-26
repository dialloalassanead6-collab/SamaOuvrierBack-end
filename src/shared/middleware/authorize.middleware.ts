// Middleware - Authorize
// Verifies user has required role(s)

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
export const authorize = (...allowedRoles: Role[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if user is authenticated (set by authenticate middleware)
      if (!req.user) {
        const error = new Error('Authentification requise') as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
      }

      // Get role from verified JWT (NEVER from client)
      const userRole = req.user.role;

      // Check if user's role is in the allowed roles list
      if (!allowedRoles.includes(userRole)) {
        const error = new Error('Permissions insuffisantes') as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
      }

      // User is authorized
      next();
    } catch (error) {
      next(error);
    }
  };
};
