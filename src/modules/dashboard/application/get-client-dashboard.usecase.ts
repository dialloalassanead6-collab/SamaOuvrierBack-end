// ============================================================================
// GET CLIENT DASHBOARD USE CASE - APPLICATION LAYER
// ============================================================================
// Cas d'utilisation pour récupérer les statistiques du dashboard client
// Optimisé avec Promise.all et Prisma aggregate
// ============================================================================

import type { IDashboardRepository } from './dashboard.repository.interface.js';
import type { ClientDashboardResponse } from '../domain/types/dashboard.types.js';

/**
 * Input pour le use case du dashboard client
 */
export interface GetClientDashboardInput {
  clientId: string;
}

/**
 * Use Case pour récupérer le dashboard du client
 * Contient toute la logique de requêtage Prisma optimisée
 */
export class GetClientDashboardUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  /**
   * Exécute le use case pour récupérer le dashboard client
   * @param input - ID du client
   * @returns Promise<ClientDashboardResponse>
   */
  async execute(input: GetClientDashboardInput): Promise<ClientDashboardResponse> {
    const { clientId } = input;

    // Déléguer au repository qui gère toute la logique Prisma
    // La gestion d'erreur est faite par le controller
    return this.dashboardRepository.getClientStats(clientId);
  }
}
