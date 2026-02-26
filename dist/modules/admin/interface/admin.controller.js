// ============================================================================
// INTERFACE LAYER - Admin Controller
// ============================================================================
// Gère les requêtes HTTP pour la validation des travailleurs par l'admin
// ============================================================================
import { WorkerStatus } from '@prisma/client';
import { ListWorkersUseCase, ApproveWorkerUseCase, RejectWorkerUseCase, ActivateUserUseCase, DeactivateUserUseCase, BanUserUseCase, UnbanUserUseCase, SoftDeleteUserUseCase, RestoreUserUseCase, } from '../application/index.js';
import { userRepository } from '../../user/infrastructure/index.js';
import { sendSuccess, sendError } from '../../../shared/utils/index.js';
import { getPaginationMetadata } from '../../../shared/middleware/pagination.middleware.js';
/**
 * Admin Controller
 *
 * RESPONSABILITÉS:
 * - Gérer les requêtes HTTP
 * - Valider les entrées
 * - Appeler les use cases
 * - Formater les réponses HTTP
 *
 * Ce pattern suit le Adapter pattern:
 * - Convertit entre requêtes HTTP et entrées de use case
 * - Est le point d'entrée pour l'application
 */
export class AdminController {
    listWorkersUseCase;
    approveWorkerUseCase;
    rejectWorkerUseCase;
    activateUserUseCase;
    deactivateUserUseCase;
    banUserUseCase;
    unbanUserUseCase;
    softDeleteUserUseCase;
    restoreUserUseCase;
    constructor() {
        // Injection de dépendances - les use cases dépendent des interfaces, pas des implémentations
        this.listWorkersUseCase = new ListWorkersUseCase(userRepository);
        this.approveWorkerUseCase = new ApproveWorkerUseCase(userRepository);
        this.rejectWorkerUseCase = new RejectWorkerUseCase(userRepository);
        this.activateUserUseCase = new ActivateUserUseCase(userRepository);
        this.deactivateUserUseCase = new DeactivateUserUseCase(userRepository);
        this.banUserUseCase = new BanUserUseCase(userRepository);
        this.unbanUserUseCase = new UnbanUserUseCase(userRepository);
        this.softDeleteUserUseCase = new SoftDeleteUserUseCase(userRepository);
        this.restoreUserUseCase = new RestoreUserUseCase(userRepository);
    }
    /**
     * Lister les travailleurs avec filtre optionnel par statut
     * GET /api/admin/workers?status=PENDING|APPROVED|REJECTED
     *
     * Pagination handled by middleware: page, pageSize
     */
    async listWorkers(req, res, next) {
        try {
            // Extract query parameters
            const statusParam = req.query.status;
            // Use pagination params from middleware (already validated and capped)
            const { page, pageSize, skip, take } = req.pagination;
            // Convert status if provided
            let status;
            if (statusParam) {
                if (!Object.values(WorkerStatus).includes(statusParam)) {
                    return sendError(res, 'Statut invalide. Les valeurs possibles sont: PENDING, APPROVED, REJECTED', 400);
                }
                status = statusParam;
            }
            // Call the use case
            const result = await this.listWorkersUseCase.execute({
                status,
                skip,
                take,
            });
            // Generate standardized pagination metadata
            const pagination = getPaginationMetadata(page, pageSize, result.total);
            // Format response
            return sendSuccess(res, 'Liste des travailleurs récupérée avec succès.', {
                workers: result.users.map((user) => user.toResponse()),
                pagination,
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Approuver un travailleur
     * PATCH /api/admin/workers/:id/approve
     */
    async approveWorker(req, res, next) {
        try {
            const workerId = req.params.id;
            // Appeler le use case
            const result = await this.approveWorkerUseCase.execute({
                workerId,
            });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                worker: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Rejeter un travailleur
     * PATCH /api/admin/workers/:id/reject
     */
    async rejectWorker(req, res, next) {
        try {
            const workerId = req.params.id;
            const { rejectionReason } = req.body;
            // Appeler le use case
            const result = await this.rejectWorkerUseCase.execute({
                workerId,
                rejectionReason,
            });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                worker: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
    // ============================================================================
    // User Management Methods
    // ============================================================================
    /**
     * Activer un utilisateur
     * PATCH /api/admin/users/:id/activate
     */
    async activateUser(req, res, next) {
        try {
            const userId = req.params.id;
            // Appeler le use case
            const result = await this.activateUserUseCase.execute({ userId });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Désactiver un utilisateur
     * PATCH /api/admin/users/:id/deactivate
     */
    async deactivateUser(req, res, next) {
        try {
            const userId = req.params.id;
            // Appeler le use case
            const result = await this.deactivateUserUseCase.execute({ userId });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Bannir un utilisateur
     * PATCH /api/admin/users/:id/ban
     */
    async banUser(req, res, next) {
        try {
            const userId = req.params.id;
            // Appeler le use case
            const result = await this.banUserUseCase.execute({ userId });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Débannir un utilisateur
     * PATCH /api/admin/users/:id/unban
     */
    async unbanUser(req, res, next) {
        try {
            const userId = req.params.id;
            // Appeler le use case
            const result = await this.unbanUserUseCase.execute({ userId });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Soft delete un utilisateur
     * DELETE /api/admin/users/:id
     */
    async softDeleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            // Appeler le use case
            const result = await this.softDeleteUserUseCase.execute({ userId });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
    /**
     * Restaurer un utilisateur soft deleted
     * PATCH /api/admin/users/:id/restore
     */
    async restoreUser(req, res, next) {
        try {
            const userId = req.params.id;
            // Appeler le use case
            const result = await this.restoreUserUseCase.execute({ userId });
            // Formater la réponse
            return sendSuccess(res, result.message, {
                user: result.user.toResponse(),
            });
        }
        catch (error) {
            return next(error);
        }
    }
}
// Export d'une instance singleton
export const adminController = new AdminController();
//# sourceMappingURL=admin.controller.js.map