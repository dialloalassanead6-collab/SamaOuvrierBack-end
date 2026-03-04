// ============================================================================
// Interface Layer - Auth Routes
// ============================================================================
// Express router for authentication endpoints
//
// Worker registration now supports file uploads:
// - REQUIRED: identityCardRecto, identityCardVerso
// - OPTIONAL: diploma
// ============================================================================

import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import type { AuthService } from '../auth.service.js';
import { createAuthRateLimiter } from '../../../shared/middleware/rate-limit.middleware.js';
import { createWorkerUploadMiddleware } from '../../../shared/middleware/upload.middleware.js';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: |
 *       Permet d'inscrire un nouveau CLIENT ou WORKER sur la plateforme.
 *       - Pour CLIENT: professionId ne doit pas etre present
 *       - Pour WORKER: professionId est obligatoire
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             inscription_client:
 *               summary: Inscription CLIENT
 *               value:
 *                 nom: "Diop"
 *                 prenom: "Moussa"
 *                 adresse: "Bloc 12, Parcelles Assainies, Dakar"
 *                 tel: "+221771234567"
 *                 email: "moussa.diop@email.com"
 *                 password: "Password123"
 *                 type: "CLIENT"
 *             inscription_worker:
 *               summary: Inscription WORKER
 *               value:
 *                 nom: "Sall"
 *                 prenom: "Fatou"
 *                 adresse: "Point E, Dakar"
 *                 tel: "+221761234567"
 *                 email: "fatou.sall@email.com"
 *                 password: "Password123"
 *                 type: "WORKER"
 *                 professionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       201:
 *         description: Inscription reussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Inscription effectuee avec succes."
 *               data:
 *                 user:
 *                   id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   nom: "Diop"
 *                   prenom: "Moussa"
 *                   adresse: "Bloc 12, Parcelles Assainies, Dakar"
 *                   tel: "+221771234567"
 *                   email: "moussa.diop@email.com"
 *                   role: "CLIENT"
 *                   workerStatus: null
 *                   professionId: null
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Donnees de validation invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       403:
 *         description: Type de compte invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "L'inscription en tant qu'administrateur n'est pas autorisee."
 *               code: "AUTH_ADMIN_FORBIDDEN"
 *       409:
 *         description: Email deja utilise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictError'
 *             example:
 *               success: false
 *               message: "Cette adresse email est deja utilisee."
 *               code: "AUTH_EMAIL_EXISTS"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     description: |
 *       Authentifie un utilisateur et retourne un token JWT.
 *       - Les workers doivent avoir un statut APPROVED pour se connecter
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "moussa.diop@email.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: Connexion reussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Mauvais identifiants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *             example:
 *               success: false
 *               message: "Email ou mot de passe incorrect."
 *               code: "AUTH_INVALID_CREDENTIALS"
 *       403:
 *         description: Compte worker en attente ou rejete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *             examples:
 *               compte_pendant:
 *                 summary: Compte en attente de validation
 *                 value:
 *                   success: false
 *                   message: "Votre compte est en attente de validation par l'administrateur."
 *                   code: "AUTH_ACCOUNT_PENDING"
 *               compte_rejete:
 *                 summary: Compte rejete
 *                 value:
 *                   success: false
 *                   message: "Votre compte a ete refuse par l'administrateur."
 *                   code: "AUTH_ACCOUNT_REJECTED"
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecte
 *     description: Retourne les informations de l'utilisateur authentifie
 *     tags:
 *       - Authentification
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Non authentifie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */

/**
 * Auth Routes
 * 
 * RESPONSABILITIES:
 * - Define all auth-related HTTP endpoints
 * - NO business logic here!
 * - Delegate to controller
 * 
 * PUBLIC ROUTES:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login user
 * 
 * PROTECTED ROUTES:
 * - GET /auth/me - Get current user profile
 */
export const createAuthRoutes = (authService: AuthService): Router => {
  const router = Router();
  
  // Create controller instance
  const authController = new AuthController(authService);

  // Public routes (no authentication required)
  // Rate limiting appliqué pour protéger contre les attaques par force brute
  // Worker registration: multipart/form-data with file uploads
  router.post('/register', 
    createAuthRateLimiter(), 
    createWorkerUploadMiddleware(),
    authController.register.bind(authController)
  );
  router.post('/login', createAuthRateLimiter(), authController.login.bind(authController));

  return router;
};
