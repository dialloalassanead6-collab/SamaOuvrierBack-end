// ============================================================================
// ROUTES - Worker Routes
// ============================================================================
// Routes pour les opérations du travailleur
// ============================================================================
import { Router } from 'express';
import { workerController } from './interface/index.js';
import { authenticate } from '../../shared/middleware/index.js';
import { authorize } from '../../shared/middleware/index.js';
import { pagination } from '../../shared/middleware/index.js';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../shared/utils/index.js';
/**
 * Router worker
 */
const router = Router();
// ============================================================================
// ROUTES PUBLIQUES (sans authentification)
// ============================================================================
/**
 * @swagger
 * /workers/public:
 *   get:
 *     summary: Liste des workers publics
 *     description: >
 *       Retourne la liste des workers approuvés et actifs.
 *       Accessible publiquement sans authentification.
 *     tags:
 *       - Worker - Public
 *     parameters:
 *       - in: query
 *         name: professionId
 *         schema:
 *           type: string
 *         description: ID de la profession pour filtrer les workers
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des workers publics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     workers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PublicWorker'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Paramètres invalides
 */
router.get('/public', pagination(), asyncHandler(workerController.listPublicWorkers.bind(workerController)));
/**
 * @swagger
 * /workers/{workerId}/services:
 *   get:
 *     summary: Services d'un worker
 *     description: >
 *       Retourne la liste des services proposés par un worker spécifique.
 *       Le worker doit être approuvé et actif.
 *     tags:
 *       - Worker - Public
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du worker
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des services du worker
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PublicService'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Worker introuvable ou non approuvé
 */
router.get('/:workerId/services', pagination(), asyncHandler(workerController.listWorkerServices.bind(workerController)));
// ============================================================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================================================
/**
 * @swagger
 * /workers/me/reapply:
 *   patch:
 *     summary: Refaire une demande de validation
 *     description: >
 *       Permet à un travailleur rejeté de refaire une demande de validation.
 *       Le travailleur doit avoir le statut REJECTED pour effectuer cette action.
 *     tags:
 *       - Worker - Gestion du compte
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Demande de validation renvoyée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     worker:
 *                       $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Le travailleur n'est pas rejeté
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (worker uniquement)
 *       404:
 *         description: Travailleur introuvable
 */
router.patch('/me/reapply', authenticate(), authorize(Role.WORKER), asyncHandler(workerController.reapply.bind(workerController)));
export default router;
//# sourceMappingURL=worker.routes.js.map