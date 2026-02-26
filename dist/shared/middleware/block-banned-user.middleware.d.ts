import type { Request, Response, NextFunction } from 'express';
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
export declare const createBlockBannedUserMiddleware: (options?: BlockBannedUserOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Default middleware instance with standard exclusions
 */
export declare const blockBannedUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=block-banned-user.middleware.d.ts.map