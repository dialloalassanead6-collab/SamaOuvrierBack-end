// ============================================================================
// GET WORKER DASHBOARD USE CASE - APPLICATION LAYER
// ============================================================================
// Cas d'utilisation pour récupérer les statistiques du dashboard worker
// Optimisé avec Promise.all et Prisma aggregate
// ============================================================================
/**
 * Use Case pour récupérer le dashboard du worker
 * Contient toute la logique de requêtage Prisma optimisée
 */
export class GetWorkerDashboardUseCase {
    dashboardRepository;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    /**
     * Exécute le use case pour récupérer le dashboard worker
     * @param input - ID du worker
     * @returns Promise<WorkerDashboardResponse>
     */
    async execute(input) {
        const { workerId } = input;
        // Déléguer au repository qui gère toute la logique Prisma
        // La gestion d'erreur est faite par le controller
        return this.dashboardRepository.getWorkerStats(workerId);
    }
}
//# sourceMappingURL=get-worker-dashboard.usecase.js.map