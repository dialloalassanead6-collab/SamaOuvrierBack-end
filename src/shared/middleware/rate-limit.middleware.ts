// Shared Middleware - Rate Limiting
// Protection contre les attaques par force brute sur les routes d'authentification

import type { Request, Response, NextFunction, RequestHandler } from 'express';

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
 * Interface pour une entrée dans le store de rate limiting
 * 
 * @interface RateLimitEntry
 * @property {number} count - Nombre de requêtes effectuées
 * @property {number} resetTime - Timestamp de réinitialisation du compteur
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Store en mémoire pour le rate limiting
 * Utilise l'adresse IP du client comme clé
 * 
 * NOTE: En production,ilinstances多方建议使用 Redis ou Memcached
 * pourune共享存储 et lapersistance entre plusieurs instances
 */
const rateLimitStore: Map<string, RateLimitEntry> = new Map();

/**
 * Nettoyage périodique des entrées expirées
 * Élimine les entrées qui ont dépassé leur fenêtre de temps
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000); // Nettoyage toutes les minutes

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
export const createRateLimitMiddleware = (options: RateLimitOptions = {}): RequestHandler => {
  // Valeurs par défaut
  const maxRequests = options.maxRequests ?? 5;
  const windowMs = options.windowMs ?? 60000; // 1 minute par défaut
  const message = options.message ?? 'Trop de tentatives de connexion. Veuillez patienter avant de réessayer.';

  return (req: Request, res: Response, next: NextFunction): void => {
    // Extraction de l'adresse IP
    // Supporte les proxies (X-Forwarded-For) et les connexions directes
    const ip = req.ip || 
               req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || 
               'unknown';

    const now = Date.now();
    
    // Récupération ou création de l'entrée pour cette IP
    let entry = rateLimitStore.get(ip);

    // Si l'entrée n'existe pas ou a expiré, créer une nouvelle entrée
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(ip, entry);
    }

    // Incrémentation du compteur de requêtes
    entry.count++;

    // Calcul du temps restant avant réinitialisation
    const remainingRequests = Math.max(0, maxRequests - entry.count);
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);

    // Ajout des headers de rate limiting (RFC 6585)
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remainingRequests);
    res.setHeader('RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    // Vérification si la limite est dépassée
    if (entry.count > maxRequests) {
      // Ajout du header Retry-After (RFC 7231)
      res.setHeader('Retry-After', retryAfterSeconds);

      // Réponse avec code 429 Too Many Requests
      res.status(429).json({
        success: false,
        message: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: retryAfterSeconds
      });
      return;
    }

    // Requête autorisée, passer au middleware suivant
    next();
  };
};

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
export const createAuthRateLimiter = (options?: RateLimitOptions): RequestHandler => {
  return createRateLimitMiddleware({
    maxRequests: options?.maxRequests ?? 5,
    windowMs: options?.windowMs ?? 60000,
    message: options?.message ?? 'Trop de tentatives de connexion. Veuillez patienter avant de réessayer.'
  });
};

export default createAuthRateLimiter;
