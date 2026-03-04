// ============================================================================
// GET CLIENT DASHBOARD USE CASE - APPLICATION LAYER
// ============================================================================
// Cas d'utilisation pour récupérer les statistiques du dashboard client
// Optimisé avec Promise.all et Prisma aggregate
// ============================================================================
/**
 * Use Case pour récupérer le dashboard du client
 * Contient toute la logique de requêtage Prisma optimisée
 */
export class GetClientDashboardUseCase {
    dashboardRepository;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    /**
     * Exécute le use case pour récupérer le dashboard client
     * @param input - ID du client
     * @returns Promise<ClientDashboardResponse>
     */
    async execute(input) {
        const { clientId } = input;
        // Déléguer au repository qui gère toute la logique Prisma
        // La gestion d'erreur est faite par le controller
        return this.dashboardRepository.getClientStats(clientId);
    }
}
//# sourceMappingURL=get-client-dashboard.usecase.js.map