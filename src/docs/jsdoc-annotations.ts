/**
 * ============================================================================
 * JSDOC ANNOTATIONS FOR CONTROLLERS
 * ============================================================================
 * Modèles d'annotations JSDoc à utiliser dans les controllers
 * Ces annotations seront détectées par swagger-jsdoc
 * ============================================================================
 * 
 * UTILISATION:
 * Copier les annotations appropriées au-dessus de chaque méthode de controller
 * ============================================================================
 */

// ============================================================================
// AUTH CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: |
 *       Permet d'inscrire un nouveau CLIENT ou WORKER sur la plateforme.
 *       - Pour CLIENT: professionId ne doit pas être présent
 *       - Pour WORKER: professionId est obligatoire
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/ClientRegisterRequest'
 *               - $ref: '#/components/schemas/WorkerRegisterRequest'
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email déjà utilisé
 */

// ============================================================================
// MISSION CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /missions:
 *   post:
 *     summary: Créer une nouvelle mission
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMissionRequest'
 *     responses:
 *       201:
 *         description: Mission créée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *
 *   get:
 *     summary: Liste des missions
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: Liste des missions
 *       401:
 *         description: Non authentifié
 */

// ============================================================================
// PAYMENT CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Créer un paiement
 *     description: Crée un nouveau paiement pour une mission
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Paiement créé
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *
 * /payments/callback:
 *   post:
 *     summary: Webhook PayTech
 *     description: |
 *       Endpoint de callback pour les notifications de paiement PayTech (IPN).
 *       Vérifie la signature et met à jour le statut du paiement.
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: header
 *         name: x-paytech-signature
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook traité
 *       400:
 *         description: Signature invalide
 */

// ============================================================================
// DISPUTE CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /disputes:
 *   post:
 *     summary: Créer une dispute
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDisputeRequest'
 *     responses:
 *       201:
 *         description: Dispute créée
 *       400:
 *         description: Erreur de validation
 *
 *   get:
 *     summary: Liste des disputes
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: Liste des disputes
 */

// ============================================================================
// REVIEW CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Créer un avis
 *     description: Crée un nouvel avis pour une mission terminée
 *     tags:
 *       - Reviews
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *     responses:
 *       201:
 *         description: Avis créé
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Mission introuvable
 *
 * /workers/{workerId}/reviews:
 *   get:
 *     summary: Liste des avis d'un worker
 *     tags:
 *       - Reviews
 *     parameters:
 *       - $ref: '#/components/parameters/workerId'
 *     responses:
 *       200:
 *         description: Liste des avis
 */

// ============================================================================
// DASHBOARD CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Statistiques du dashboard admin
 *     description: |
 *       Récupère les statistiques complètes du dashboard pour l'administrateur.
 *       Inclut les statistiques utilisateurs, missions, paiements et litiges.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *     responses:
 *       200:
 *         description: Statistiques du dashboard
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *
 * /dashboard/worker:
 *   get:
 *     summary: Statistiques du dashboard worker
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du dashboard
 *
 * /dashboard/client:
 *   get:
 *     summary: Statistiques du dashboard client
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du dashboard
 */

// ============================================================================
// ADMIN CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /admin/workers:
 *   get:
 *     summary: Liste des travailleurs
 *     description: |
 *       Récupère la liste des travailleurs avec un filtre optionnel par statut.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Liste des travailleurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *
 * /admin/workers/{id}/approve:
 *   patch:
 *     summary: Approuver un travailleur
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: Travailleur approuvé
 *       400:
 *         description: Erreur de validation
 *
 * /admin/workers/{id}/reject:
 *   patch:
 *     summary: Rejeter un travailleur
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Travailleur rejeté
 */

// ============================================================================
// NOTIFICATION CONTROLLER ANNOTATIONS
// ============================================================================

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Liste des notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: Liste des notifications
 *
 *   post:
 *     summary: Créer une notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Notification créée
 *
 * /notifications/unread-count:
 *   get:
 *     summary: Nombre de notifications non lues
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications
 *
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marquer comme lue
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/notificationId'
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *
 * /notifications/read-all:
 *   patch:
 *     summary: Marquer toutes comme lues
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marquées comme lues
 */

// ============================================================================
// COMPONENT SCHEMAS REFERENCE
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             code:
 *               type: string
 * 
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Authentification échouée"
 * 
 *     ForbiddenError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Permissions insuffisantes"
 * 
 *     NotFoundError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Ressource introuvable"
 * 
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: object
 *           properties:
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   message:
 *                     type: string
 * 
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         pageSize:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 100
 *         totalPages:
 *           type: integer
 *           example: 10
 */

export {};
