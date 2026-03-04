// ============================================================================
// GET MISSIONS USE CASE - APPLICATION LAYER
// ============================================================================
// Récupère la liste des missions avec pagination
// ============================================================================

import type { IMissionRepository } from './mission.repository.interface.js';
import type { MissionResponse, MissionWithDetails } from '../domain/index.js';

/**
 * Get Missions Use Case
 * 
 * RESPONSABILITÉ:
 * - Récupérer la liste des missions avec pagination
 * - Filtrer par clientId ou workerId si fourni
 * - Retourner les missions avec leurs détails
 */
export class GetMissionsUseCase {
  private readonly missionRepository: IMissionRepository;

  constructor(missionRepository: IMissionRepository) {
    this.missionRepository = missionRepository;
  }

  /**
   * Exécute la récupération des missions
   * @param skip - Nombre d'enregistrements à ignorer
   * @param take - Nombre d'enregistrements à récupérer
   * @param clientId - Filtrer par client (optionnel)
   * @param workerId - Filtrer par worker (optionnel)
   * @param withDetails - Inclure les détails du client, worker et service
   * @returns Liste des missions et total
   */
  async execute(
    skip: number, 
    take: number, 
    clientId?: string, 
    workerId?: string,
    withDetails: boolean = false
  ): Promise<{ missions: MissionResponse[]; total: number }> {
    // Validation des paramètres de pagination
    if (skip < 0) {
      throw new Error('Le paramètre skip doit être positif ou nul.');
    }
    if (take < 1) {
      throw new Error('Le paramètre take doit être au moins 1.');
    }
    if (take > 100) {
      throw new Error('Le paramètre take ne peut pas dépasser 100.');
    }

    // Récupérer les missions
    if (withDetails) {
      const result = await this.missionRepository.findAllWithDetails(skip, take, clientId, workerId);
      return {
        missions: result.missions,
        total: result.total,
      };
    }

    const result = await this.missionRepository.findAll(skip, take, clientId, workerId);
    return {
      missions: result.missions.map(m => m.toResponse()),
      total: result.total,
    };
  }

  /**
   * Récupère une mission par ID avec ses détails
   * @param missionId - ID de la mission
   * @returns La mission avec ses détails
   */
  async getById(missionId: string): Promise<MissionWithDetails | null> {
    if (!missionId || missionId.trim().length === 0) {
      throw new Error('L\'ID de la mission est requis.');
    }

    return this.missionRepository.findByIdWithDetails(missionId);
  }
}
