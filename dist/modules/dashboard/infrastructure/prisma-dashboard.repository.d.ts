import { PrismaClient } from '@prisma/client';
import type { IDashboardRepository } from '../application/dashboard.repository.interface.js';
import type { DashboardFilters, AdminDashboardResponse, WorkerDashboardResponse, ClientDashboardResponse } from '../domain/types/dashboard.types.js';
export declare class PrismaDashboardRepository implements IDashboardRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    /**
     * Récupère toutes les statistiques pour le dashboard worker
     * Utilise Promise.all pour paralléliser les requêtes
     * Utilise aggregate Prisma pour éviter N+1
     */
    getWorkerStats(workerId: string): Promise<WorkerDashboardResponse>;
    /**
     * Statistiques des missions du worker
     * Utilise groupBy pour obtenir le décompte par status
     */
    private getWorkerMissionStats;
    /**
     * Statistiques de revenus du worker
     * Utilise aggregate _sum pour calculer les revenus
     */
    private getWorkerRevenueStats;
    /**
     * Statistiques de réputation du worker
     * Utilise aggregate _avg et _count
     */
    private getWorkerReputationStats;
    /**
     * Statistiques des litiges du worker
     * Compte les litiges non résolus
     */
    private getWorkerDisputeStats;
    /**
     * Récupère toutes les statistiques admin
     * Toutes les requêtes sont parallélisées pour la performance
     */
    getAdminStats(filters: DashboardFilters): Promise<AdminDashboardResponse>;
    /**
     * Statistiques utilisateurs - avec filtres temporels
     * Utilise uniquement count() pour la performance
     */
    private getUserStats;
    /**
     * Statistiques missions - avec filtres temporels et groupBy
     */
    private getMissionStats;
    /**
     * Statistiques paiements - avec filtres temporels et aggregate
     */
    private getPaymentStats;
    /**
     * Statistiques litiges - avec filtres temporels
     */
    private getDisputeStats;
    /**
     * Données temporelles pour graphiques
     * Groupement par jour si ≤ 30 jours, sinon par mois
     */
    private getTimelineData;
    /**
     * Timeline des revenus - requêtes agrégées par date
     */
    private getRevenueTimeline;
    /**
     * Timeline des missions - requêtes agrégées par date
     */
    private getMissionsTimeline;
    /**
     * Récupère toutes les statistiques pour le dashboard client
     * Utilise Promise.all pour paralléliser les requêtes
     * @param clientId - ID du client (récupéré depuis req.user.sub)
     */
    getClientStats(clientId: string): Promise<ClientDashboardResponse>;
    /**
     * Statistiques des missions du client
     * Utilise groupBy pour obtenir le décompte par status
     */
    private getClientMissionStats;
    /**
     * Statistiques de dépenses du client
     * Utilise aggregate _sum pour calculer les dépenses
     */
    private getClientSpendingStats;
    /**
     * Statistiques de fiabilité du client
     * Calcule le taux d'annulation et de litiges
     */
    private getClientReliabilityStats;
    /**
     * Statistiques des avis du client
     * Compte le nombre de reviews créées par le client
     */
    private getClientReviewsStats;
    /**
     * Construit le filtre de date pour Prisma
     */
    private buildDateFilter;
}
//# sourceMappingURL=prisma-dashboard.repository.d.ts.map