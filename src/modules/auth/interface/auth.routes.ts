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
 *       
 *       ## Types d'inscription
 *       
 *       ### Pour CLIENT:
 *       - type: "CLIENT"
 *       - professionId ne doit PAS être présent
 *       - Envoyez les données en JSON
 *       
 *       ### Pour WORKER:
 *       - type: "WORKER"
 *       - professionId est **obligatoire** (UUID de la profession)
 *       - Envoyez en multipart/form-data avec les fichiers suivants:
 *       
 *       ### Fichiers REQUIS (multipart/form-data):
 *       - identityCardRecto: Fichier du recto de la pièce d'identité (CNI, passeport)
 *       - identityCardVerso: Fichier du verso de la pièce d'identité
 *       
 *       ### Fichier OPTIONNEL:
 *       - diploma: Fichier du diplôme ou certificat (optionnel)
 *       
 *       Types de fichiers acceptés: image/jpeg, image/png, application/pdf
 *     tags:
 *       - Auth
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - adresse
 *               - tel
 *               - email
 *               - password
 *               - type
 *             properties:
 *               nom:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nom de famille
 *                 example: "Sall"
 *               prenom:
 *                 type: string
 *                 maxLength: 100
 *                 description: Prénom
 *                 example: "Fatou"
 *               adresse:
 *                 type: string
 *                 maxLength: 255
 *                 description: Adresse
 *                 example: "Point E, Dakar"
 *               tel:
 *                 type: string
 *                 maxLength: 20
 *                 description: Numéro de téléphone
 *                 example: "+221761234567"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 description: Adresse email
 *                 example: "fatou.sall@email.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 description: Mot de passe
 *                 example: "Password123"
 *               type:
 *                 type: string
 *                 enum: [CLIENT, WORKER]
 *                 description: Type de compte (CLIENT ou WORKER)
 *                 example: "WORKER"
 *               professionId:
 *                 type: string
 *                 format: uuid
 *                 description: |
 *                   UUID de la profession (SEULLEMENT pour WORKER, obligatoire si type=WORKER)
 *                 example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *               identityCardRecto:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   **SEULEMENT pour WORKER - REQUIS**
 *                   Fichier du recto de la pièce d'identité (CNI, passeport, permis de conduire)
 *                   Types: image/jpeg, image/png, application/pdf
 *               identityCardVerso:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   **SEULEMENT pour WORKER - REQUIS**
 *                   Fichier du verso de la pièce d'identité
 *                   Types: image/jpeg, image/png, application/pdf
 *               diploma:
 *                 type: string
 *                 format: binary
 *                 nullable: true
 *                 description: |
 *                   **SEULEMENT pour WORKER - OPTIONNEL**
 *                   Fichier du diplôme ou certificat
 *                   Types: image/jpeg, image/png, application/pdf
 *           examples:
 *             inscription_client:
 *               summary: Inscription CLIENT
 *               description: Pour CLIENT, n'incluez pas professionId ni les fichiers
 *               value:
 *                 nom: "Diop"
 *                 prenom: "Moussa"
 *                 adresse: "Bloc 12, Parcelles Assainies, Dakar"
 *                 tel: "+221771234567"
 *                 email: "moussa.diop@email.com"
 *                 password: "Password123"
 *                 type: "CLIENT"
 *             inscription_worker:
 *               summary: Inscription WORKER avec documents
 *               description: |
 *                 Pour WORKER:
 *                 1. Cliquez sur "Choose File" pour identityCardRecto (obligatoire)
 *                 2. Cliquez sur "Choose File" pour identityCardVerso (obligatoire)
 *                 3. Optionally cliquez sur "Choose File" pour diploma
 *               value:
 *                 nom: "Sall"
 *                 prenom: "Fatou"
 *                 adresse: "Point E, Dakar"
 *                 tel: "+221761234567"
 *                 email: "fatou.sall@email.com"
 *                 password: "Password123"
 *                 type: "WORKER"
 *                 professionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 identityCardRecto: "(cliquez Choose File pour sélectionner)"
 *                 identityCardVerso: "(cliquez Choose File pour sélectionner)"
 *                 diploma: "(cliquez Choose File pour sélectionner - optionnel)"
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Inscription effectuée avec succès."
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
 *         description: Données invalides ou fichiers manquants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Erreur de validation des données
 *                 value:
 *                   success: false
 *                   message: "Les données fournies sont invalides."
 *                   code: "VALIDATION_ERROR"
 *               missing_identitycard_recto:
 *                 summary: Fichier recto d'identité manquant
 *                 value:
 *                   success: false
 *                   message: "Le fichier identityCardRecto (recto de la carte d'identité) est requis pour l'inscription worker"
 *                   code: "MISSING_FILE"
 *               missing_identitycard_verso:
 *                 summary: Fichier verso d'identité manquant
 *                 value:
 *                   success: false
 *                   message: "Le fichier identityCardVerso (verso de la carte d'identité) est requis pour l'inscription worker"
 *                   code: "MISSING_FILE"
 *       403:
 *         description: Type de compte invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "L'inscription en tant qu'administrateur n'est pas autorisée."
 *               code: "AUTH_ADMIN_FORBIDDEN"
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConflictError'
 *             example:
 *               success: false
 *               message: "Cette adresse email est déjà utilisée."
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
 *       - Auth
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
 *       - Auth
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
