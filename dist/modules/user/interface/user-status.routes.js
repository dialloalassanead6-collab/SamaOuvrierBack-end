// ============================================================================
// INTERFACE LAYER - User Status Routes
// ============================================================================
// Routes pour la gestion du statut utilisateur (activation, ban, soft-delete)
// ============================================================================
import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';
import { authorize } from '../../../shared/middleware/authorize.middleware.js';
import { asyncHandler } from '../../../shared/utils/index.js';
import { sendSuccess, sendError } from '../../../shared/utils/index.js';
import { ToggleUserActivationUseCase, ToggleOwnActivationUseCase, ToggleUserBanUseCase, SoftDeleteUserUseCase, } from '../application/index.js';
import { userRepository } from '../infrastructure/index.js';
/**
 * User Status Controller
 *
 * RESPONSABILITÉS:
 * - Gérer les requêtes HTTP pour le statut utilisateur
 * - Valider les entrées
 * - Appeler les use cases
 * - Formater les réponses HTTP
 */
class UserStatusController {
    toggleUserActivationUseCase;
    toggleOwnActivationUseCase;
    toggleUserBanUseCase;
    softDeleteUserUseCase;
    constructor() {
        this.toggleUserActivationUseCase = new ToggleUserActivationUseCase(userRepository);
        this.toggleOwnActivationUseCase = new ToggleOwnActivationUseCase(userRepository);
        this.toggleUserBanUseCase = new ToggleUserBanUseCase(userRepository);
        this.softDeleteUserUseCase = new SoftDeleteUserUseCase(userRepository);
    }
    /**
     * Activer/désactiver un utilisateur (ADMIN uniquement)
     * PATCH /users/:id/activation
     */
    async toggleUserActivation(req, res, next) {
        try {
            const userId = req.params.id;
            const { action } = req.body;
            // Validate action
            if (!action || !['activate', 'deactivate'].includes(action)) {
                return sendError(res, 'Action invalide. Les valeurs possibles sont: activate, deactivate', 400);
            }
            const result = await this.toggleUserActivationUseCase.execute({
                userId,
                action,
            });
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
                isActive: result.isActive,
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Activer/désactiver son propre compte
     * PATCH /users/me/activation
     */
    async toggleOwnActivation(req, res, next) {
        try {
            // Get current user ID from request (set by authenticate middleware)
            const currentUserId = req.user.id;
            const { action } = req.body;
            // Validate action
            if (!action || !['activate', 'deactivate'].includes(action)) {
                return sendError(res, 'Action invalide. Les valeurs possibles sont: activate, deactivate', 400);
            }
            const result = await this.toggleOwnActivationUseCase.execute({
                currentUserId,
                action,
            });
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
                isActive: result.isActive,
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Bannir/débannir un utilisateur (ADMIN uniquement)
     * PATCH /users/:id/ban
     */
    async toggleUserBan(req, res, next) {
        try {
            const userId = req.params.id;
            const { action } = req.body;
            // Validate action
            if (!action || !['ban', 'unban'].includes(action)) {
                return sendError(res, 'Action invalide. Les valeurs possibles sont: ban, unban', 400);
            }
            const result = await this.toggleUserBanUseCase.execute({
                userId,
                action,
            });
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
                isBanned: result.isBanned,
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Soft delete un utilisateur (ADMIN uniquement)
     * DELETE /users/:id
     */
    async softDeleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            const result = await this.softDeleteUserUseCase.execute({ userId });
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
                deletedAt: result.deletedAt,
            });
        }
        catch (error) {
            return next(error);
        }
    }
}
const userStatusController = new UserStatusController();
// ============================================================================
// Routes
// ============================================================================
const router = Router();
/**
 * @swagger
 * /users/me/activation:
 *   patch:
 *     summary: Activer/désactiver son propre compte
 *     description: >
 *       Permet à un utilisateur d'activer ou désactiver son propre compte.
 *       Un utilisateur banni ne peut pas effectuer cette action.
 *     tags:
 *       - Utilisateurs - Statut
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate]
 *                 description: Action à effectuer
 *     responses:
 *       200:
 *         description: Statut du compte modifié
 *       400:
 *         description: Action invalide ou utilisateur déjà actif/inactif
 *       403:
 *         description: Accès refusé (utilisateur banni)
 */
router.patch('/me/activation', authenticate(), asyncHandler(userStatusController.toggleOwnActivation.bind(userStatusController)));
/**
 * @swagger
 * /users/:id/activation:
 *   patch:
 *     summary: Activer/désactiver un utilisateur (admin)
 *     description: >
 *       Permet à un administrateur d'activer ou désactiver n'importe quel utilisateur.
 *       Impossible de modifier un utilisateur supprimé.
 *     tags:
 *       - Utilisateurs - Statut (Admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate]
 *                 description: Action à effectuer
 *     responses:
 *       200:
 *         description: Statut du compte modifié
 *       400:
 *         description: Action invalide ou utilisateur déjà actif/inactif
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/:id/activation', authenticate(), authorize(Role.ADMIN), asyncHandler(userStatusController.toggleUserActivation.bind(userStatusController)));
/**
 * @swagger
 * /users/:id/ban:
 *   patch:
 *     summary: Bannir/débannir un utilisateur (admin)
 *     description: >
 *       Permet à un administrateur de bannir ou débannir n'importe quel utilisateur.
 *       Impossible de modifier un utilisateur supprimé.
 *     tags:
 *       - Utilisateurs - Statut (Admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [ban, unban]
 *                 description: Action à effectuer
 *     responses:
 *       200:
 *         description: Statut de ban modifié
 *       400:
 *         description: Action invalide ou utilisateur déjà banni/non banni
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/:id/ban', authenticate(), authorize(Role.ADMIN), asyncHandler(userStatusController.toggleUserBan.bind(userStatusController)));
export default router;
//# sourceMappingURL=user-status.routes.js.map