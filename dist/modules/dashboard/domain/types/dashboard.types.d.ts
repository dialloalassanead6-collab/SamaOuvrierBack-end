import type { MissionStatus, DisputeStatus } from '@prisma/client';
import type { DerivedKpis } from '../../application/calculate-kpi.service.js';
/**
 * Filtres temporels pour les requêtes dashboard
 */
export interface DashboardFilters {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
}
/**
 * Périodes prédéfinies
 */
export type DashboardPeriod = '7d' | '30d' | '90d' | '1y';
/**
 * Informations de base du worker
 */
export interface WorkerInfo {
    id: string;
    name: string;
    email: string;
}
/**
 * Statistiques des missions du worker
 */
export interface WorkerMissionStats {
    totalMissions: number;
    missionsInProgress: number;
    missionsCompleted: number;
    completionRate: number;
}
/**
 * Statistiques de revenus du worker
 */
export interface WorkerRevenueStats {
    totalRevenue: number;
    revenueThisMonth: number;
    averageMissionValue: number;
}
/**
 * Statistiques de réputation du worker
 */
export interface WorkerReputationStats {
    averageRating: number;
    totalReviews: number;
}
/**
 * Statistiques des litiges du worker
 */
export interface WorkerDisputeStats {
    openDisputes: number;
}
/**
 * Réponse complète du dashboard worker
 */
export interface WorkerDashboardResponse {
    worker: WorkerInfo;
    stats: WorkerMissionStats;
    revenue: WorkerRevenueStats;
    reputation: WorkerReputationStats;
    disputes: WorkerDisputeStats;
}
/**
 * Statistiques des utilisateurs
 */
export interface UserStats {
    total: number;
    clients: number;
    workers: number;
    workersPending: number;
    workersApproved: number;
    workersRejected: number;
    newUsersInPeriod: number;
    activeUsers: number;
    bannedUsers: number;
}
/**
 * Statistiques des missions
 */
export interface MissionStats {
    total: number;
    byStatus: Record<MissionStatus, number>;
    completedInPeriod: number;
    cancelledInPeriod: number;
    completionRate: number;
    cancellationRate: number;
}
/**
 * Statistiques des paiements
 */
export interface PaymentStats {
    totalRevenue: number;
    revenueInPeriod: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    paymentSuccessRate: number;
    averageTransactionAmount: number;
    platformCommissionTotal: number;
    escrowHeld: number;
    escrowReleased: number;
}
/**
 * Statistiques des litiges
 */
export interface DisputeStats {
    total: number;
    byStatus: Record<DisputeStatus, number>;
    open: number;
    resolvedInPeriod: number;
    disputeRate: number;
}
/**
 * Point de données pour les séries temporelles
 */
export interface TimelinePoint {
    date: string;
    value: number;
}
/**
 * Séries temporelles pour les graphiques
 */
export interface TimelineData {
    revenueTimeline: TimelinePoint[];
    missionsTimeline: TimelinePoint[];
}
/**
 * Réponse complète du dashboard admin
 */
export interface AdminDashboardResponse {
    userStats: UserStats;
    missionStats: MissionStats;
    paymentStats: PaymentStats;
    disputeStats: DisputeStats;
    timelineData: TimelineData;
    derivedKpis?: DerivedKpis;
    filters: {
        startDate: string | null;
        endDate: string | null;
        period: string | null;
    };
    generatedAt: string;
}
/**
 * Informations de base du client
 */
export interface ClientInfo {
    id: string;
    name: string;
    email: string;
}
/**
 * Statistiques des missions du client
 */
export interface ClientMissionStats {
    totalMissions: number;
    missionsInProgress: number;
    missionsCompleted: number;
    missionsCancelled: number;
}
/**
 * Statistiques de dépenses du client
 */
export interface ClientSpendingStats {
    totalSpent: number;
    spentThisMonth: number;
    averageMissionCost: number;
}
/**
 * Statistiques de fiabilité du client
 */
export interface ClientReliabilityStats {
    cancellationRate: number;
    disputeRate: number;
}
/**
 * Statistiques des avis du client
 */
export interface ClientReviewsStats {
    totalReviewsGiven: number;
}
/**
 * Réponse complète du dashboard client
 */
export interface ClientDashboardResponse {
    client: ClientInfo;
    stats: ClientMissionStats;
    spending: ClientSpendingStats;
    reliability: ClientReliabilityStats;
    reviews: ClientReviewsStats;
}
//# sourceMappingURL=dashboard.types.d.ts.map