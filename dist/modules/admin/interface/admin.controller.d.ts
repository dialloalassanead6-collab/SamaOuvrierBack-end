import type { Request, Response, NextFunction } from 'express';
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
export declare class AdminController {
    private listWorkersUseCase;
    private approveWorkerUseCase;
    private rejectWorkerUseCase;
    private activateUserUseCase;
    private deactivateUserUseCase;
    private banUserUseCase;
    private unbanUserUseCase;
    private softDeleteUserUseCase;
    private restoreUserUseCase;
    constructor();
    /**
     * Lister les travailleurs avec filtre optionnel par statut
     * GET /api/admin/workers?status=PENDING|APPROVED|REJECTED
     *
     * Pagination handled by middleware: page, pageSize
     */
    listWorkers(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Approuver un travailleur
     * PATCH /api/admin/workers/:id/approve
     */
    approveWorker(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Rejeter un travailleur
     * PATCH /api/admin/workers/:id/reject
     */
    rejectWorker(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Activer un utilisateur
     * PATCH /api/admin/users/:id/activate
     */
    activateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Désactiver un utilisateur
     * PATCH /api/admin/users/:id/deactivate
     */
    deactivateUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Bannir un utilisateur
     * PATCH /api/admin/users/:id/ban
     */
    banUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Débannir un utilisateur
     * PATCH /api/admin/users/:id/unban
     */
    unbanUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Soft delete un utilisateur
     * DELETE /api/admin/users/:id
     */
    softDeleteUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Restaurer un utilisateur soft deleted
     * PATCH /api/admin/users/:id/restore
     */
    restoreUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
export declare const adminController: AdminController;
//# sourceMappingURL=admin.controller.d.ts.map