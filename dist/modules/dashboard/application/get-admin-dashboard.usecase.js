// ============================================================================
// USE CASE: Get Admin Dashboard
// ============================================================================
// Récupère les statistiques complètes du dashboard admin
// avec filtres temporels optionnels
// ============================================================================
import { CalculateKpiService } from './calculate-kpi.service.js';
/**
 * Use case pour récupérer les statistiques du dashboard admin
 */
export class GetAdminDashboardUseCase {
    dashboardRepository;
    kpiService;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
        this.kpiService = new CalculateKpiService();
    }
    /**
     * Exécute le use case
     */
    async execute(input = {}) {
        // Convertir les filtres
        const filters = this.parseFilters(input);
        // Récupérer les statistiques via le repository
        const stats = await this.dashboardRepository.getAdminStats(filters);
        // Calculer les KPIs dérivés
        const derivedKpis = this.kpiService.calculateDerivedKpis({
            userStats: stats.userStats,
            missionStats: stats.missionStats,
            paymentStats: stats.paymentStats,
            disputeStats: stats.disputeStats,
        });
        // Retourner la réponse enrichie
        return {
            ...stats,
            derivedKpis,
        };
    }
    /**
     * Parse les filtres d'entrée en objet DashboardFilters
     */
    parseFilters(input) {
        const filters = {};
        // Si une période prédéfinie est fournie
        if (input.period) {
            const { startDate, endDate } = this.calculatePeriodDates(input.period);
            filters.startDate = startDate;
            filters.endDate = endDate;
        }
        // Si des dates personnalisées sont fournies
        else if (input.startDate || input.endDate) {
            filters.startDate = input.startDate ? new Date(input.startDate) : undefined;
            filters.endDate = input.endDate ? new Date(input.endDate) : undefined;
        }
        return filters;
    }
    /**
     * Calcule les dates de début et fin pour une période prédéfinie
     */
    calculatePeriodDates(period) {
        const now = new Date();
        const endDate = now;
        let startDate;
        switch (period) {
            case '7d':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                // Par défaut, 30 jours
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
        }
        return { startDate, endDate };
    }
}
//# sourceMappingURL=get-admin-dashboard.usecase.js.map