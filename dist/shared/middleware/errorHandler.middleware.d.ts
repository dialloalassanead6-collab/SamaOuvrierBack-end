import type { Request, Response, NextFunction } from 'express';
/**
 * Interface pour les erreurs avec statusCode
 */
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
}
/**
 * Middleware de gestion des erreurs global
 *
 * @param err - Erreur capturée
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param _next - Fonction next (non utilisée mais requise par Express)
 */
export declare const errorHandler: (err: AppError, req: Request, res: Response, _next: NextFunction) => void;
/**
 * Créer une nouvelle erreur opérationnelle
 */
export declare const createError: (message: string, statusCode: number) => AppError;
/**
 * Gestionnaire pour les routes non trouvées (404)
 */
export declare const notFoundHandler: (_req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.middleware.d.ts.map