// ============================================================================
// CONTROLLER D'AUTHENTIFICATION
// ============================================================================
// Gère les requêtes HTTP pour l'authentification.
// Délègue la logique métier au AuthService.
// NE contient PAS de logique métier.
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../auth.service.js';
import type { RegisterRequest, LoginRequest } from './auth.validation.js';
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
  constructor(private readonly authService: AuthService) {}

  /**
   * Inscription d'un nouvel utilisateur
   * POST /auth/register
   */
  async register(
    req: Request<unknown, unknown, RegisterRequest>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Connexion utilisateur
   * POST /auth/login
   */
  async login(
    req: Request<unknown, unknown, LoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // Validation de la requête
      const validatedData = loginSchema.parse({ body: req.body });

      // Exécution de la connexion
      const result = await this.authService.login(
        validatedData.body.email,
        validatedData.body.password
      );

      // Réponse de succès (200 OK) - MUST RETURN
      return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, {
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  }
}
