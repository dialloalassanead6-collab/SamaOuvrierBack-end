import type { UserStats, MissionStats, PaymentStats, DisputeStats } from '../domain/types/dashboard.types.js';
/**
 * Service pour calculer les KPIs dérivés
 */
export declare class CalculateKpiService {
    /**
     * Calcule les KPIs dérivés à partir des statistiques brutes
     */
    calculateDerivedKpis(stats: {
        userStats: UserStats;
        missionStats: MissionStats;
        paymentStats: PaymentStats;
        disputeStats: DisputeStats;
    }): DerivedKpis;
    /**
     * Calcule le taux de missions actives
     */
    private calculateActiveMissionRate;
    /**
     * Calcule un score de santé global de la plateforme (0-100)
     */
    private calculatePlatformHealthScore;
}
/**
 * KPIs dérivés calculés par le service
 */
export interface DerivedKpis {
    workerApprovalRate: number;
    workerRejectionRate: number;
    pendingWorkerRate: number;
    missionSuccessRate: number;
    missionActiveRate: number;
    averageRevenuePerMission: number;
    platformMarginRate: number;
    resolutionRate: number;
    platformHealthScore: number;
}
//# sourceMappingURL=calculate-kpi.service.d.ts.map