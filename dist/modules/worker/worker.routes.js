// ============================================================================
// ROUTES - Worker Routes
// ============================================================================
// Routes pour les opérations du travailleur
// ============================================================================
import { Router } from 'express';
import { workerController } from './interface/index.js';
import { authenticate } from '../../shared/middleware/index.js';
import { authorize } from '../../shared/middleware/index.js';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../shared/utils/index.js';
/**
 * Router worker
 */
const router = Router();
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