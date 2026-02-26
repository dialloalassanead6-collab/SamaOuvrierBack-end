// ============================================================================
// SHARED MIDDLEWARE - Block Banned/Deleted Users Middleware
// ============================================================================
// Middleware optionnel pour bloquer automatiquement les utilisateurs bannis/supprimés
// SAUF pour les routes de login/auth
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { userRepository } from '../../modules/user/infrastructure/index.js';

/**
 * Options de configuration pour le middleware
 */
export interface BlockBannedUserOptions {
  /** Chemins à exclure du blocage (ex: /api/auth/login) */
  excludePaths?: string[];
  /** Patterns de chemins à exclure (ex: ^/api/auth) */
  excludePatterns?: RegExp[];
}

/**
 * Middleware pour bloquer les utilisateurs bannis ou supprimés
 * 
 * UTILISATION:
 * - Ce middleware est optionnel
 * - Il doit être placed APRÈS le middleware authenticate()
 * - Il bloque automatiquement les utilisateurs bannis ou supprimés
 * - SAUF pour les routes d'authentification (login)
 * 
 * RÈGLES:
 * - Si isBanned = true → block (403 Forbidden)
 * - Si deletedAt != null → block (403 Forbidden)
 * - isActive = false → PERMETTRE (utilisateur désactivé peut accéder)
 */
export const createBlockBannedUserMiddleware = (options: BlockBannedUserOptions = {}) => {
  const { excludePaths = [], excludePatterns = [] } = options;

  // Default exclusions: auth routes
  const defaultExcludePatterns = [
    /^\/api\/auth\//,           // All auth routes
    /^\/api\/users\/me\/activation$/, // Allow users to reactivate their own account
    /^\/health$/,                // Health check
  ];

  const allExcludePatterns = [...defaultExcludePatterns, ...excludePatterns];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip if this is an excluded path
      const path = req.path;
      
      if (excludePaths.includes(path)) {
        return next();
      }

      // Check against exclude patterns
      for (const pattern of allExcludePatterns) {
        if (pattern.test(path)) {
          return next();
        }
      }

      // Get user from request (set by authenticate middleware)
      const user = (req as Request & { user?: { id: string; role: Role } }).user;

      // If no user, let authenticate middleware handle it
      if (!user) {
        return next();
      }

      // Get full user details to check ban/delete status
      const fullUser = await userRepository.findById(user.id);

      // If user not found or is deleted, block
      if (!fullUser) {
        return next();
      }

      // Check if user is banned
      if (fullUser.isBanned) {
        res.status(403).json({
          success: false,
          message: 'Votre compte a été banni. Veuillez contacter l\'administrateur.',
          code: 'USER_BANNED',
        });
        return;
      }

      // Check if user is deleted (soft deleted)
      if (fullUser.deletedAt !== null) {
        res.status(403).json({
          success: false,
          message: 'Votre compte a été supprimé.',
          code: 'USER_DELETED',
        });
        return;
      }

      // User is allowed, continue
      return next();
    } catch (error) {
      // On error, let the request pass through (fail open)
      // This prevents blocking users due to middleware errors
      console.error('BlockBannedUserMiddleware error:', error);
      return next();
    }
  };
};

/**
 * Default middleware instance with standard exclusions
 */
export const blockBannedUser = createBlockBannedUserMiddleware();
