import type { RequestHandler } from 'express';
/**
 * Configuration du rate limiting
 *
 * @interface RateLimitOptions
 * @property {number} maxRequests - Nombre maximum de requêtes autorisées (défaut: 5)
 * @property {number} windowMs - Fenêtre de temps en millisecondes (défaut: 60000ms = 1 minute)
 * @property {string} message - Message personnalisé affiché lors du dépassement de limite
 */
export interface RateLimitOptions {
    maxRequests?: number;
    windowMs?: number;
    message?: string;
}
/**
 * Middleware de rate limiting pour Express
 *
 * Fonctionnement:
 * 1. Extraction de l'adresse IP du client (supporte proxies via X-Forwarded-For)
 * 2. Vérification du nombre de requêtes dans la fenêtre de temps
 * 3. Incrémentation du compteur ou blocage si limite dépassée
 * 4. Ajout des headers RateLimit-* pour informer le client
 *
 * @param {RateLimitOptions} options - Options de configuration
 * @returns {RequestHandler} Middleware Express
 *
 * @example
 * // Configuration par défaut: 5 requêtes par minute
 * const rateLimiter = createRateLimitMiddleware();
 *
 * @example
 * // Configuration personnalisée: 10 requêtes toutes les 2 minutes
 * const rateLimiter = createRateLimitMiddleware({
 *   maxRequests: 10,
 *   windowMs: 120000,
 *   message: 'Trop de tentatives. Réessayez dans quelques instants.'
 * });
 */
export declare const createRateLimitMiddleware: (options?: RateLimitOptions) => RequestHandler;
/**
 * Factory function pour créer un middleware de rate limiting
 * avec configuration spécifique pour l'authentification
 *
 * @param {RateLimitOptions} [options] - Options optionnelles pour surcharger les valeurs par défaut
 * @returns {RequestHandler} Middleware configuré
 *
 * @example
 * // Utilisation dans les routes auth
 * router.post('/login', createAuthRateLimiter(), authController.login);
 * router.post('/register', createAuthRateLimiter(), authController.register);
 */
export declare const createAuthRateLimiter: (options?: RateLimitOptions) => RequestHandler;
export default createAuthRateLimiter;
//# sourceMappingURL=rate-limit.middleware.d.ts.map