// ============================================================================
// CALCULATE KPI SERVICE - APPLICATION LAYER
// ============================================================================
// Service pour les calculs métier des KPIs dashboard
// ============================================================================
/**
 * Service pour calculer les KPIs dérivés
 */
export class CalculateKpiService {
    /**
     * Calcule les KPIs dérivés à partir des statistiques brutes
     */
    calculateDerivedKpis(stats) {
        const { userStats, missionStats, paymentStats, disputeStats } = stats;
        return {
            // KPIs Utilisateurs
            workerApprovalRate: userStats.workers > 0
                ? Math.round((userStats.workersApproved / userStats.workers) * 10000) / 100
                : 0,
            workerRejectionRate: userStats.workers > 0
                ? Math.round((userStats.workersRejected / userStats.workers) * 10000) / 100
                : 0,
            pendingWorkerRate: userStats.workers > 0
                ? Math.round((userStats.workersPending / userStats.workers) * 10000) / 100
                : 0,
            // KPIs Missions
            missionSuccessRate: missionStats.total > 0
                ? Math.round((missionStats.completedInPeriod / missionStats.total) * 10000) / 100
                : 0,
            missionActiveRate: missionStats.total > 0
                ? this.calculateActiveMissionRate(missionStats.byStatus, missionStats.total)
                : 0,
            // KPIs Paiements
            averageRevenuePerMission: missionStats.completedInPeriod > 0
                ? Math.round((paymentStats.revenueInPeriod / missionStats.completedInPeriod) * 100) / 100
                : 0,
            platformMarginRate: paymentStats.totalRevenue > 0
                ? Math.round((paymentStats.platformCommissionTotal / paymentStats.totalRevenue) * 10000) / 100
                : 0,
            // KPIs Litiges
            resolutionRate: disputeStats.total > 0
                ? Math.round(((disputeStats.total - disputeStats.open) / disputeStats.total) * 10000) / 100
                : 0,
            // Score global de santé de la plateforme
            platformHealthScore: this.calculatePlatformHealthScore({
                userStats,
                missionStats,
                paymentStats,
                disputeStats,
            }),
        };
    }
    /**
     * Calcule le taux de missions actives
     */
    calculateActiveMissionRate(missionStatuses, total) {
        const activeStatuses = [
            'PENDING_PAYMENT',
            'PENDING_ACCEPT',
            'CONTACT_UNLOCKED',
            'NEGOTIATION_DONE',
            'AWAITING_FINAL_PAYMENT',
            'IN_PROGRESS',
        ];
        const activeCount = activeStatuses.reduce((sum, status) => sum + (missionStatuses[status] ?? 0), 0);
        return total > 0 ? Math.round((activeCount / total) * 10000) / 100 : 0;
    }
    /**
     * Calcule un score de santé global de la plateforme (0-100)
     */
    calculatePlatformHealthScore(stats) {
        let score = 100;
        // Pénalité pour taux de bannissement élevé
        if (stats.userStats.total > 0) {
            const banRate = stats.userStats.bannedUsers / stats.userStats.total;
            score -= banRate * 20; // Max -20 points
        }
        // Pénalité pour taux d'annulation élevé
        score -= Math.min(stats.missionStats.cancellationRate, 20);
        // Pénalité pour taux d'échec de paiement élevé
        score -= (100 - stats.paymentStats.paymentSuccessRate) * 0.1;
        // Pénalité pour taux de litige élevé
        score -= Math.min(stats.disputeStats.disputeRate * 2, 15);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
//# sourceMappingURL=calculate-kpi.service.js.map