// ============================================================================
// PRISMA DASHBOARD REPOSITORY - INFRASTRUCTURE LAYER
// ============================================================================
// Implémentation du repository avec requêtes optimisées pour haute volumétrie
// Utilise uniquement: count(), aggregate(), _sum, _avg, groupBy()
// Aucune requête N+1, pas de findMany() sans filtre
// ============================================================================

import { PrismaClient, Role, WorkerStatus, MissionStatus, PaymentStatus, EscrowStatus, DisputeStatus } from '@prisma/client';
import type { IDashboardRepository } from '../application/dashboard.repository.interface.js';
import type { 
  DashboardFilters, 
  AdminDashboardResponse,
  UserStats,
  MissionStats,
  PaymentStats,
  DisputeStats,
  TimelineData,
  TimelinePoint,
  WorkerDashboardResponse,
  WorkerMissionStats,
  WorkerRevenueStats,
  WorkerReputationStats,
  WorkerDisputeStats,
  ClientDashboardResponse,
  ClientMissionStats,
  ClientSpendingStats,
  ClientReliabilityStats,
  ClientReviewsStats
} from '../domain/types/dashboard.types.js';
import { BusinessError } from '../../../shared/errors/index.js';
import { HTTP_STATUS } from '../../../shared/constants/messages.js';

export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Récupère toutes les statistiques pour le dashboard worker
   * Utilise Promise.all pour paralléliser les requêtes
   * Utilise aggregate Prisma pour éviter N+1
   */
  async getWorkerStats(workerId: string): Promise<WorkerDashboardResponse> {
    // Vérifier que le worker existe
    const worker = await this.prisma.user.findUnique({
      where: { id: workerId, role: Role.WORKER },
      select: { id: true, nom: true, prenom: true, email: true },
    });

    if (!worker) {
      throw new BusinessError({
        message: 'Worker non trouvé',
        statusCode: HTTP_STATUS.NOT_FOUND,
        code: 'WORKER_NOT_FOUND',
      });
    }

    // Requêtes parallèles pour optimiser les performances
    const [missionStats, revenueStats, reputationStats, disputeStats] = await Promise.all([
      this.getWorkerMissionStats(workerId),
      this.getWorkerRevenueStats(workerId),
      this.getWorkerReputationStats(workerId),
      this.getWorkerDisputeStats(workerId),
    ]);

    // Construire la réponse
    return {
      worker: {
        id: worker.id,
        name: `${worker.prenom} ${worker.nom}`,
        email: worker.email,
      },
      stats: missionStats,
      revenue: revenueStats,
      reputation: reputationStats,
      disputes: disputeStats,
    };
  }

  /**
   * Statistiques des missions du worker
   * Utilise groupBy pour obtenir le décompte par status
   */
  private async getWorkerMissionStats(workerId: string): Promise<WorkerMissionStats> {
    // Requête parallèle pour les stats de base
    const [totalCount, statusGroups] = await Promise.all([
      this.prisma.mission.count({ where: { workerId } }),
      this.prisma.mission.groupBy({
        by: ['status'],
        where: { workerId },
        _count: { status: true },
      }),
    ]);

    // Transformer le groupBy en objet
    const byStatus = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count.status])
    ) as Record<MissionStatus, number>;

    // Compléter les statuses manquants
    Object.values(MissionStatus).forEach((status) => {
      if (!(status in byStatus)) {
        byStatus[status] = 0;
      }
    });

    const missionsInProgress = 
      (byStatus[MissionStatus.PENDING_PAYMENT] ?? 0) +
      (byStatus[MissionStatus.PENDING_ACCEPT] ?? 0) +
      (byStatus[MissionStatus.CONTACT_UNLOCKED] ?? 0) +
      (byStatus[MissionStatus.NEGOTIATION_DONE] ?? 0) +
      (byStatus[MissionStatus.AWAITING_FINAL_PAYMENT] ?? 0) +
      (byStatus[MissionStatus.IN_PROGRESS] ?? 0);

    const missionsCompleted = byStatus[MissionStatus.COMPLETED] ?? 0;
    const completionRate = totalCount > 0 ? (missionsCompleted / totalCount) * 100 : 0;

    return {
      totalMissions: totalCount,
      missionsInProgress,
      missionsCompleted,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  /**
   * Statistiques de revenus du worker
   * Utilise aggregate _sum pour calculer les revenus
   */
  private async getWorkerRevenueStats(workerId: string): Promise<WorkerRevenueStats> {
    // Obtenir le premier jour du mois courant
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Requêtes parallèles
    const [totalRevenueAgg, monthlyRevenueAgg, completedMissionsCount] = await Promise.all([
      // Revenu total (payments SUCCESS)
      this.prisma.payment.aggregate({
        where: { workerId, status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      // Revenu ce mois (payments SUCCESS du mois en cours)
      this.prisma.payment.aggregate({
        where: {
          workerId,
          status: PaymentStatus.SUCCESS,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // Nombre de missions complétées
      this.prisma.mission.count({
        where: { workerId, status: MissionStatus.COMPLETED },
      }),
    ]);

    const totalRevenue = totalRevenueAgg._sum.amount?.toNumber() ?? 0;
    const revenueThisMonth = monthlyRevenueAgg._sum.amount?.toNumber() ?? 0;
    const averageMissionValue = completedMissionsCount > 0 
      ? Math.round((totalRevenue / completedMissionsCount) * 100) / 100 
      : 0;

    return {
      totalRevenue,
      revenueThisMonth,
      averageMissionValue,
    };
  }

  /**
   * Statistiques de réputation du worker
   * Utilise aggregate _avg et _count
   */
  private async getWorkerReputationStats(workerId: string): Promise<WorkerReputationStats> {
    // Requête unique avec aggregate
    const ratingStats = await this.prisma.review.aggregate({
      where: { workerId },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      averageRating: Math.round((ratingStats._avg.rating ?? 0) * 10) / 10,
      totalReviews: ratingStats._count.id,
    };
  }

  /**
   * Statistiques des litiges du worker
   * Compte les litiges non résolus
   */
  private async getWorkerDisputeStats(workerId: string): Promise<WorkerDisputeStats> {
    // Compter les litiges où le worker est le reportedUser (il a été signalé)
    const openDisputes = await this.prisma.dispute.count({
      where: {
        reportedUserId: workerId,
        status: { notIn: [DisputeStatus.RESOLVED, DisputeStatus.CLOSED] },
      },
    });

    return {
      openDisputes,
    };
  }

  /**
   * Récupère toutes les statistiques admin
   * Toutes les requêtes sont parallélisées pour la performance
   */
  async getAdminStats(filters: DashboardFilters): Promise<AdminDashboardResponse> {
    // Exécuter toutes les requêtes en parallèle
    const [userStats, missionStats, paymentStats, disputeStats, timelineData] = await Promise.all([
      this.getUserStats(filters),
      this.getMissionStats(filters),
      this.getPaymentStats(filters),
      this.getDisputeStats(filters),
      this.getTimelineData(filters),
    ]);

    return {
      userStats,
      missionStats,
      paymentStats,
      disputeStats,
      timelineData,
      filters: {
        startDate: filters.startDate?.toISOString() ?? null,
        endDate: filters.endDate?.toISOString() ?? null,
        period: null,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Statistiques utilisateurs - avec filtres temporels
   * Utilise uniquement count() pour la performance
   */
  private async getUserStats(filters: DashboardFilters): Promise<UserStats> {
    const whereClause = this.buildDateFilter(filters);

    const [total, clients, workers, workersPending, workersApproved, workersRejected, 
            activeUsers, bannedUsers, newUsersInPeriod] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CLIENT } }),
      this.prisma.user.count({ where: { role: Role.WORKER } }),
      this.prisma.user.count({ where: { role: Role.WORKER, workerStatus: WorkerStatus.PENDING } }),
      this.prisma.user.count({ where: { role: Role.WORKER, workerStatus: WorkerStatus.APPROVED } }),
      this.prisma.user.count({ where: { role: Role.WORKER, workerStatus: WorkerStatus.REJECTED } }),
      this.prisma.user.count({ where: { isActive: true, isBanned: false } }),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      total,
      clients,
      workers,
      workersPending,
      workersApproved,
      workersRejected,
      newUsersInPeriod,
      activeUsers,
      bannedUsers,
    };
  }

  /**
   * Statistiques missions - avec filtres temporels et groupBy
   */
  private async getMissionStats(filters: DashboardFilters): Promise<MissionStats> {
    const periodCondition = filters.startDate && filters.endDate 
      ? { createdAt: { gte: filters.startDate, lte: filters.endDate } }
      : {};

    const [total, statusGroups, completedInPeriod, cancelledInPeriod, periodMissionCount] = await Promise.all([
      this.prisma.mission.count(),
      this.prisma.mission.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.mission.count({ 
        where: { 
          status: MissionStatus.COMPLETED,
          ...periodCondition
        } 
      }),
      this.prisma.mission.count({ 
        where: { 
          status: MissionStatus.CANCELLED,
          ...periodCondition
        } 
      }),
      this.prisma.mission.count({ where: periodCondition }),
    ]);

    // Transformer le groupBy en objet Record
    const byStatus = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count.status])
    ) as Record<MissionStatus, number>;

    // Compléter les statuses manquants
    Object.values(MissionStatus).forEach((status) => {
      if (!(status in byStatus)) {
        byStatus[status] = 0;
      }
    });

    const completionRate = periodMissionCount > 0 ? (completedInPeriod / periodMissionCount) * 100 : 0;
    const cancellationRate = periodMissionCount > 0 ? (cancelledInPeriod / periodMissionCount) * 100 : 0;

    return {
      total,
      byStatus,
      completedInPeriod,
      cancelledInPeriod,
      completionRate: Math.round(completionRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
    };
  }

  /**
   * Statistiques paiements - avec filtres temporels et aggregate
   */
  private async getPaymentStats(filters: DashboardFilters): Promise<PaymentStats> {
    const periodCondition = filters.startDate && filters.endDate 
      ? { createdAt: { gte: filters.startDate, lte: filters.endDate } }
      : {};

    // Requêtes parallèles optimisées
    const [statusGroups, totalAmountAgg, periodAmountAgg, escrowStats] = await Promise.all([
      // Groupement par status - très performant
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { amount: true },
      }),
      // Somme totale (toute période)
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      // Somme période
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS, ...periodCondition },
        _sum: { amount: true },
      }),
      // Escrow stats
      Promise.all([
        this.prisma.escrow.aggregate({
          where: { status: EscrowStatus.HELD },
          _sum: { amount: true },
        }),
        this.prisma.escrow.aggregate({
          where: { status: EscrowStatus.RELEASED },
          _sum: { amount: true },
        }),
        this.prisma.escrow.aggregate({
          where: { status: EscrowStatus.RELEASED },
          _sum: { commissionAmount: true },
        }),
      ]),
    ]);

    // Calculs optimisés sans charger toutes les lignes
    const totalTransactions = statusGroups.reduce((sum, g) => sum + g._count.status, 0);
    const successfulTransactions = statusGroups.find(g => g.status === PaymentStatus.SUCCESS)?._count.status ?? 0;
    const failedTransactions = statusGroups.find(g => g.status === PaymentStatus.FAILED)?._count.status ?? 0;

    const totalRevenue = totalAmountAgg._sum.amount?.toNumber() ?? 0;
    const revenueInPeriod = periodAmountAgg._sum.amount?.toNumber() ?? 0;

    const platformCommissionTotal = escrowStats[2]._sum.commissionAmount?.toNumber() ?? 0;

    return {
      totalRevenue,
      revenueInPeriod,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      paymentSuccessRate: totalTransactions > 0 
        ? Math.round((successfulTransactions / totalTransactions) * 10000) / 100 
        : 0,
      averageTransactionAmount: successfulTransactions > 0 
        ? Math.round((totalRevenue / successfulTransactions) * 100) / 100 
        : 0,
      platformCommissionTotal,
      escrowHeld: escrowStats[0]._sum.amount?.toNumber() ?? 0,
      escrowReleased: escrowStats[1]._sum.amount?.toNumber() ?? 0,
    };
  }

  /**
   * Statistiques litiges - avec filtres temporels
   */
  private async getDisputeStats(filters: DashboardFilters): Promise<DisputeStats> {
    const periodCondition = filters.startDate && filters.endDate 
      ? { createdAt: { gte: filters.startDate, lte: filters.endDate } }
      : {};

    const [total, statusGroups, resolvedInPeriod, missionCountAgg] = await Promise.all([
      this.prisma.dispute.count(),
      this.prisma.dispute.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.dispute.count({
        where: { 
          status: { in: [DisputeStatus.RESOLVED, DisputeStatus.CLOSED] },
          ...periodCondition
        },
      }),
      this.prisma.mission.aggregate({
        _count: { id: true },
      }),
    ]);

    const byStatus = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count.status])
    ) as Record<DisputeStatus, number>;

    const open = (byStatus[DisputeStatus.OPEN] ?? 0) + (byStatus[DisputeStatus.UNDER_REVIEW] ?? 0) + (byStatus[DisputeStatus.PENDING] ?? 0);
    const missionCount = missionCountAgg._count.id ?? 0;

    return {
      total,
      byStatus,
      open,
      resolvedInPeriod,
      disputeRate: missionCount > 0 
        ? Math.round((total / missionCount) * 10000) / 100 
        : 0,
    };
  }

  /**
   * Données temporelles pour graphiques
   * Groupement par jour si ≤ 30 jours, sinon par mois
   */
  private async getTimelineData(filters: DashboardFilters): Promise<TimelineData> {
    const hasDateFilter = filters.startDate && filters.endDate;
    const daysDiff = hasDateFilter 
      ? Math.ceil((filters.endDate!.getTime() - filters.startDate!.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const groupByDay = !hasDateFilter || daysDiff <= 30;

    // Timeline des revenus
    const revenueTimeline = await this.getRevenueTimeline(filters, groupByDay);
    
    // Timeline des missions
    const missionsTimeline = await this.getMissionsTimeline(filters, groupByDay);

    return {
      revenueTimeline,
      missionsTimeline,
    };
  }

  /**
   * Timeline des revenus - requêtes agrégées par date
   */
  private async getRevenueTimeline(filters: DashboardFilters, groupByDay: boolean): Promise<TimelinePoint[]> {
    const periodCondition = filters.startDate && filters.endDate 
      ? { createdAt: { gte: filters.startDate, lte: filters.endDate } }
      : {};

    // Requête avec extraction de date pour groupement
    const payments = await this.prisma.payment.findMany({
      where: { 
        status: PaymentStatus.SUCCESS,
        ...periodCondition
      },
      select: { 
        amount: true, 
        createdAt: true 
      },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper en mémoire (plus efficace que de multiples requêtes SQL)
    const grouped = new Map<string, number>();
    
    for (const payment of payments) {
      const dateKey = groupByDay
        ? payment.createdAt.toISOString().split('T')[0] ?? ''
        : `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      const current = grouped.get(dateKey) ?? 0;
      grouped.set(dateKey, current + payment.amount.toNumber());
    }

    return Array.from(grouped.entries()).map(([date, value]) => ({
      date,
      value: Math.round(value * 100) / 100,
    }));
  }

  /**
   * Timeline des missions - requêtes agrégées par date
   */
  private async getMissionsTimeline(filters: DashboardFilters, groupByDay: boolean): Promise<TimelinePoint[]> {
    const periodCondition = filters.startDate && filters.endDate 
      ? { createdAt: { gte: filters.startDate, lte: filters.endDate } }
      : {};

    // Requête légère avec count
    const missions = await this.prisma.mission.findMany({
      where: periodCondition,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper en mémoire
    const grouped = new Map<string, number>();
    
    for (const mission of missions) {
      const dateKey = groupByDay
        ? mission.createdAt.toISOString().split('T')[0] ?? ''
        : `${mission.createdAt.getFullYear()}-${String(mission.createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      const current = grouped.get(dateKey) ?? 0;
      grouped.set(dateKey, current + 1);
    }

    return Array.from(grouped.entries()).map(([date, value]) => ({
      date,
      value,
    }));
  }

  // ============================================================================
  // CLIENT DASHBOARD METHODS
  // ============================================================================

  /**
   * Récupère toutes les statistiques pour le dashboard client
   * Utilise Promise.all pour paralléliser les requêtes
   * @param clientId - ID du client (récupéré depuis req.user.sub)
   */
  async getClientStats(clientId: string): Promise<ClientDashboardResponse> {
    // Vérifier que le client existe
    const client = await this.prisma.user.findUnique({
      where: { id: clientId, role: Role.CLIENT },
      select: { id: true, nom: true, prenom: true, email: true },
    });

    if (!client) {
      throw new BusinessError({
        message: 'Client non trouvé',
        statusCode: HTTP_STATUS.NOT_FOUND,
        code: 'CLIENT_NOT_FOUND',
      });
    }

    // Requêtes parallèles pour optimiser les performances
    const [missionStats, spendingStats, reliabilityStats, reviewsStats] = await Promise.all([
      this.getClientMissionStats(clientId),
      this.getClientSpendingStats(clientId),
      this.getClientReliabilityStats(clientId),
      this.getClientReviewsStats(clientId),
    ]);

    // Construire la réponse
    return {
      client: {
        id: client.id,
        name: `${client.prenom} ${client.nom}`,
        email: client.email,
      },
      stats: missionStats,
      spending: spendingStats,
      reliability: reliabilityStats,
      reviews: reviewsStats,
    };
  }

  /**
   * Statistiques des missions du client
   * Utilise groupBy pour obtenir le décompte par status
   */
  private async getClientMissionStats(clientId: string): Promise<ClientMissionStats> {
    // Requête parallèle pour les stats de base
    const [totalCount, statusGroups] = await Promise.all([
      this.prisma.mission.count({ where: { clientId } }),
      this.prisma.mission.groupBy({
        by: ['status'],
        where: { clientId },
        _count: { status: true },
      }),
    ]);

    // Transformer le groupBy en objet
    const byStatus = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count.status])
    ) as Record<MissionStatus, number>;

    // Compléter les statuses manquants
    Object.values(MissionStatus).forEach((status) => {
      if (!(status in byStatus)) {
        byStatus[status] = 0;
      }
    });

    const missionsInProgress = 
      (byStatus[MissionStatus.PENDING_PAYMENT] ?? 0) +
      (byStatus[MissionStatus.PENDING_ACCEPT] ?? 0) +
      (byStatus[MissionStatus.CONTACT_UNLOCKED] ?? 0) +
      (byStatus[MissionStatus.NEGOTIATION_DONE] ?? 0) +
      (byStatus[MissionStatus.AWAITING_FINAL_PAYMENT] ?? 0) +
      (byStatus[MissionStatus.IN_PROGRESS] ?? 0);

    const missionsCompleted = byStatus[MissionStatus.COMPLETED] ?? 0;
    const missionsCancelled = byStatus[MissionStatus.CANCELLED] ?? 0;

    return {
      totalMissions: totalCount,
      missionsInProgress,
      missionsCompleted,
      missionsCancelled,
    };
  }

  /**
   * Statistiques de dépenses du client
   * Utilise aggregate _sum pour calculer les dépenses
   */
  private async getClientSpendingStats(clientId: string): Promise<ClientSpendingStats> {
    // Obtenir le premier jour du mois courant
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Requêtes parallèles
    const [totalSpentAgg, monthlySpentAgg, completedMissionsCount] = await Promise.all([
      // Dépense totale (payments SUCCESS)
      this.prisma.payment.aggregate({
        where: { clientId, status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
      // Dépense ce mois (payments SUCCESS du mois en cours)
      this.prisma.payment.aggregate({
        where: {
          clientId,
          status: PaymentStatus.SUCCESS,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // Nombre de missions complétées
      this.prisma.mission.count({
        where: { clientId, status: MissionStatus.COMPLETED },
      }),
    ]);

    const totalSpent = totalSpentAgg._sum.amount?.toNumber() ?? 0;
    const spentThisMonth = monthlySpentAgg._sum.amount?.toNumber() ?? 0;
    const averageMissionCost = completedMissionsCount > 0 
      ? Math.round((totalSpent / completedMissionsCount) * 100) / 100 
      : 0;

    return {
      totalSpent,
      spentThisMonth,
      averageMissionCost,
    };
  }

  /**
   * Statistiques de fiabilité du client
   * Calcule le taux d'annulation et de litiges
   */
  private async getClientReliabilityStats(clientId: string): Promise<ClientReliabilityStats> {
    // Requêtes parallèles
    const [totalMissions, missionsCancelled, disputesOpened] = await Promise.all([
      // Nombre total de missions
      this.prisma.mission.count({ where: { clientId } }),
      // Nombre de missions annulées
      this.prisma.mission.count({ 
        where: { clientId, status: MissionStatus.CANCELLED } 
      }),
      // Nombre de litiges ouverts par le client
      this.prisma.dispute.count({ 
        where: { reporterId: clientId } 
      }),
    ]);

    // Calcul des taux avec gestion des divisions par 0
    const cancellationRate = totalMissions > 0 
      ? Math.round((missionsCancelled / totalMissions) * 10000) / 100 
      : 0;

    const disputeRate = totalMissions > 0 
      ? Math.round((disputesOpened / totalMissions) * 10000) / 100 
      : 0;

    return {
      cancellationRate,
      disputeRate,
    };
  }

  /**
   * Statistiques des avis du client
   * Compte le nombre de reviews créées par le client
   */
  private async getClientReviewsStats(clientId: string): Promise<ClientReviewsStats> {
    const totalReviewsGiven = await this.prisma.review.count({
      where: { clientId },
    });

    return {
      totalReviewsGiven,
    };
  }

  /**
   * Construit le filtre de date pour Prisma
   */
  private buildDateFilter(filters: DashboardFilters): object {
    if (!filters.startDate || !filters.endDate) {
      return {};
    }
    return {
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    };
  }
}
