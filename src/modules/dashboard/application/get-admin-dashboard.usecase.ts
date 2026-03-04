// ============================================================================
// USE CASE: Get Admin Dashboard
// ============================================================================
// Récupère les statistiques complètes du dashboard admin
// avec filtres temporels optionnels
// ============================================================================

import type { IDashboardRepository } from './dashboard.repository.interface.js';
import { CalculateKpiService, type DerivedKpis } from './calculate-kpi.service.js';
import type { DashboardFilters, AdminDashboardResponse, DashboardPeriod } from '../domain/types/dashboard.types.js';

/**
 * Paramètres d'entrée pour le use case
 */
export interface GetAdminDashboardInput {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
}

/**
 * Use case pour récupérer les statistiques du dashboard admin
 */
export class GetAdminDashboardUseCase {
  private readonly kpiService: CalculateKpiService;

  constructor(private readonly dashboardRepository: IDashboardRepository) {
    this.kpiService = new CalculateKpiService();
  }

  /**
   * Exécute le use case
   */
  async execute(input: GetAdminDashboardInput = {}): Promise<AdminDashboardResponse> {
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
  private parseFilters(input: GetAdminDashboardInput): DashboardFilters {
    const filters: DashboardFilters = {};

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
  private calculatePeriodDates(period: DashboardPeriod): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = now;
    let startDate: Date;

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

/**
 * Extension de la réponse avec les KPIs dérivés
 */
export interface AdminDashboardResponseWithKpis extends AdminDashboardResponse {
  derivedKpis: DerivedKpis;
}
