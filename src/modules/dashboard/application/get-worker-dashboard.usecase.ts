// ============================================================================
// GET WORKER DASHBOARD USE CASE - APPLICATION LAYER
// ============================================================================
// Cas d'utilisation pour récupérer les statistiques du dashboard worker
// Optimisé avec Promise.all et Prisma aggregate
// ============================================================================

import type { IDashboardRepository } from './dashboard.repository.interface.js';
import type { WorkerDashboardResponse } from '../domain/types/dashboard.types.js';

/**
 * Input pour le use case du dashboard worker
 */
export interface GetWorkerDashboardInput {
  workerId: string;
}

/**
 * Use Case pour récupérer le dashboard du worker
 * Contient toute la logique de requêtage Prisma optimisée
 */
export class GetWorkerDashboardUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  /**
   * Exécute le use case pour récupérer le dashboard worker
   * @param input - ID du worker
   * @returns Promise<WorkerDashboardResponse>
   */
  async execute(input: GetWorkerDashboardInput): Promise<WorkerDashboardResponse> {
    const { workerId } = input;

    // Déléguer au repository qui gère toute la logique Prisma
    // La gestion d'erreur est faite par le controller
    return this.dashboardRepository.getWorkerStats(workerId);
  }
}
