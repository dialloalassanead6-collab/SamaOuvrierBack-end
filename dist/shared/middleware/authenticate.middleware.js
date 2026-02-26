// Middleware - Authenticate
// Verifies JWT token and injects user into request
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config/config.js';
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
export const authenticate = () => {
    return async (req, _res, next) => {
        try {
            // Extract Bearer token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                const error = new Error('Autorisation manquante');
                error.statusCode = 401;
                throw error;
            }
            // Check for Bearer token format
            const parts = authHeader.split(' ');
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                const error = new Error('Format d\'autorisation invalide');
                error.statusCode = 401;
                throw error;
            }
            const token = parts[1];
            if (!token) {
                const error = new Error('Bearer token manquant');
                error.statusCode = 401;
                throw error;
            }
            // Verify token
            const secret = config.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET non configuré');
            }
            const decoded = jwt.verify(token, secret);
            // Inject user into request
            req.user = decoded;
            next();
        }
        catch (error) {
            // Return 401 for any authentication errors
            if (error.statusCode === 401) {
                next(error);
                return;
            }
            const authError = new Error('Authentification échouée');
            authError.statusCode = 401;
            next(authError);
        }
    };
};
//# sourceMappingURL=authenticate.middleware.js.map