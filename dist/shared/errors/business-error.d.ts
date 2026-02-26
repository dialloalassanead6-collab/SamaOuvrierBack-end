/**
 * Propriétés d'une erreur métier
 */
export interface BusinessErrorOptions {
    /** Message d'erreur en français */
    message: string;
    /** Code HTTP à retourner */
    statusCode?: number;
    /** Code d'erreur personnalisé pour le client */
    code?: string;
    /** Erreurs détaillées (pour la validation) */
    errors?: Record<string, unknown> | undefined;
    /** Indique si l'erreur est opérationnelle (connue) */
    isOperational?: boolean;
}
/**
 * Classe d'erreur métier
 *
 * Utilisation:
 * throw new BusinessError({
 *   message: 'Email déjà utilisé',
 *   statusCode: 409,
 *   code: 'EMAIL_EXISTS'
 * });
 */
export declare class BusinessError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly errors?: Record<string, unknown> | undefined;
    readonly isOperational: boolean;
    constructor(options: BusinessErrorOptions);
    /**
     * Convertir l'erreur en objet pour la sérialisation JSON
     */
    toJSON(): Record<string, unknown>;
}
/**
 * Factory pour créer rapidement des erreurs métier courantes
 */
export declare const BusinessErrors: {
    /**
     * Erreur 400 - Données invalides
     */
    badRequest: (message: string, errors?: Record<string, unknown> | undefined) => BusinessError;
    /**
     * Erreur 401 - Non autorisé
     */
    unauthorized: (message?: string) => BusinessError;
    /**
     * Erreur 403 - Accès refusé
     */
    forbidden: (message?: string) => BusinessError;
    /**
     * Erreur 404 - Ressource non trouvée
     */
    notFound: (message?: string) => BusinessError;
    /**
     * Erreur 409 - Conflit (ex: email déjà utilisé)
     */
    conflict: (message: string, errors?: Record<string, unknown> | undefined) => BusinessError;
    /**
     * Erreur 500 - Erreur interne
     */
    internal: (message?: string) => BusinessError;
};
//# sourceMappingURL=business-error.d.ts.map