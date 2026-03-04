import type { Request, Response } from 'express';
import { GetAdminDashboardUseCase, GetWorkerDashboardUseCase, GetClientDashboardUseCase } from '../application/index.js';
/**
 * Controller pour le dashboard admin
 */
export declare class DashboardController {
    private readonly getAdminDashboardUseCase;
    private readonly getWorkerDashboardUseCase;
    private readonly getClientDashboardUseCase;
    constructor(getAdminDashboardUseCase: GetAdminDashboardUseCase, getWorkerDashboardUseCase: GetWorkerDashboardUseCase, getClientDashboardUseCase: GetClientDashboardUseCase);
    /**
     * GET /api/dashboard/admin
     * Récupère les statistiques du dashboard admin
     *
     * @queryParam period - Période prédéfinie (7d, 30d, 90d, 1y)
     * @queryParam startDate - Date de début (YYYY-MM-DD)
     * @queryParam endDate - Date de fin (YYYY-MM-DD)
     */
    getAdminDashboard(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/dashboard/worker
     * Récupère les statistiques du dashboard worker
     * Le workerId est récupéré depuis req.user.id
     */
    getWorkerDashboard(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/dashboard/client
     * Récupère les statistiques du dashboard client
     * Le clientId est récupéré exclusivement depuis req.user.sub (JWT token)
     * Aucune donnée n'est acceptée depuis query ou params pour des raisons de sécurité
     */
    getClientDashboard(req: Request, res: Response): Promise<void>;
    /**
     * Valide le format d'une date (YYYY-MM-DD)
     */
    private isValidDate;
}
//# sourceMappingURL=dashboard.controller.d.ts.map