// Middleware - Authenticate
// Verifies JWT token and injects user into request

import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config/config.js';

// Extend Express Request type to include user
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
export const authenticate = (): ((
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract Bearer token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        const error = new Error('Autorisation manquante') as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
      }

      // Check for Bearer token format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        const error = new Error('Format d\'autorisation invalide') as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
      }

      const token = parts[1];
      if (!token) {
        const error = new Error('Bearer token manquant') as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
      }

      // Verify token
      const secret = config.JWT_SECRET as unknown as string;
      if (!secret) {
        throw new Error('JWT_SECRET non configuré');
      }
      const decoded = jwt.verify(token, secret) as unknown as {
        sub: string;
        email: string;
        role: Role;
      };

      // Inject user into request
      req.user = decoded;

      next();
    } catch (error) {
      // Return 401 for any authentication errors
      if ((error as Error & { statusCode?: number }).statusCode === 401) {
        next(error);
        return;
      }
      
      const authError = new Error('Authentification échouée') as Error & { statusCode: number };
      authError.statusCode = 401;
      next(authError);
    }
  };
};
