import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../auth.service.js';
import type { LoginRequest } from './auth.validation.js';
/**
 * Auth Controller
 *
 * RESPONSABILITÉS:
 * - Gérer les requêtes/réponses HTTP
 * - Valider les entrées avec Zod
 * - Déléguer au AuthService
 * - AUCUNE logique métier ici!
 */
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    /**
     * Inscription d'un nouvel utilisateur
     * POST /auth/register
     *
     * Pour les WORKERS:
     * - identityCardRecto: REQUIRED (uploaded file)
     * - identityCardVerso: REQUIRED (uploaded file)
     * - diploma: OPTIONAL (uploaded file)
     */
    register(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Connexion utilisateur
     * POST /auth/login
     */
    login(req: Request<unknown, unknown, LoginRequest>, res: Response, next: NextFunction): Promise<Response | void>;
}
//# sourceMappingURL=auth.controller.d.ts.map