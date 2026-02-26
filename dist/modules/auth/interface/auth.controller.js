// ============================================================================
// CONTROLLER D'AUTHENTIFICATION
// ============================================================================
// Gère les requêtes HTTP pour l'authentification.
// Délègue la logique métier au AuthService.
// NE contient PAS de logique métier.
// ============================================================================
import { registerSchema, loginSchema } from './auth.validation.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/api-response.js';
import { AUTH_MESSAGES } from '../../../shared/constants/messages.js';
/**
 * Auth Controller
 *
 * RESPONSABILITÉS:
 * - Gérer les requêtes/réponses HTTP
 * - Valider les entrées avec Zod
 * - Déléguer au AuthService
 * - AUCUNE logique métier ici!
 */
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Inscription d'un nouvel utilisateur
     * POST /auth/register
     */
    async register(req, res, next) {
        try {
            // Validation de la requête
            const validatedData = registerSchema.parse(req.body);
            // Exécution de l'inscription
            const result = await this.authService.register(validatedData);
            // Réponse de succès (201 Created) - MUST RETURN
            return sendCreated(res, AUTH_MESSAGES.REGISTER_SUCCESS, {
                user: result.user,
                token: result.token,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Connexion utilisateur
     * POST /auth/login
     */
    async login(req, res, next) {
        try {
            // Validation de la requête
            const validatedData = loginSchema.parse({ body: req.body });
            // Exécution de la connexion
            const result = await this.authService.login(validatedData.body.email, validatedData.body.password);
            // Réponse de succès (200 OK) - MUST RETURN
            return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, {
                user: result.user,
                token: result.token,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=auth.controller.js.map