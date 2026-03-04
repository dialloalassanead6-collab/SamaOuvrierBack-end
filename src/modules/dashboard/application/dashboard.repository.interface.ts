// ============================================================================
// DASHBOARD REPOSITORY INTERFACE - APPLICATION LAYER
// ============================================================================
// Contrat pour l'accès aux données du dashboard
// Implémenté par PrismaDashboardRepository
// ============================================================================

import type { DashboardFilters, AdminDashboardResponse, WorkerDashboardResponse, ClientDashboardResponse } from '../domain/types/dashboard.types.js';

/**
 * Dashboard Repository Interface
 * 
 * Contrat spécialisé pour les statistiques agrégées du dashboard admin
 * Utilise uniquement des requêtes optimisées (count, aggregate, groupBy)
 */
export interface IDashboardRepository {
  /**
   * Récupère toutes les statistiques admin avec les filtres temporels
   * @param filters - Filtres temporels (startDate, endDate)
   */
  getAdminStats(filters: DashboardFilters): Promise<AdminDashboardResponse>;

  /**
   * Récupère toutes les statistiques pour le dashboard worker
   * @param workerId - ID du worker
   */
  getWorkerStats(workerId: string): Promise<WorkerDashboardResponse>;

  /**
   * Récupère toutes les statistiques pour le dashboard client
   * @param clientId - ID du client
   */
  getClientStats(clientId: string): Promise<ClientDashboardResponse>;
}
