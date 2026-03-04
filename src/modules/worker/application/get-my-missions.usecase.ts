// ============================================================================
// USE CASE: Obtenir les missions du worker connecté
// ============================================================================
// Ce use case permet à un worker de récupérer ses propres missions.
// Sécurisé car l'ID vient du JWT.
// ============================================================================

import { Role, WorkerStatus } from '@prisma/client';
import type { IUserRepository } from '../../user/application/index.js';
import type { IMissionRepository } from '../../mission/application/index.js';
import type { MissionWithDetails } from '../../mission/domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES } from '../../../shared/constants/messages.js';

/**
 * Input DTO pour get-my-missions
 */
export interface GetMyMissionsInput {
  /** ID du worker (extrait du JWT) */
  workerId: string;
  /** Nombre d'enregistrements à ignorer */
  skip?: number;
  /** Nombre d'enregistrements à récupérer */
  take?: number;
}

/**
 * Output DTO pour get-my-missions
 */
export interface GetMyMissionsOutput {
  /** Liste des missions */
  missions: MissionWithDetails[];
  /** Nombre total */
  total: number;
}

/**
 * Use Case: Obtenir les missions du worker connecté
 * 
 * RESPONSABILITÉS:
 * - Vérifier que le worker existe
 * - Vérifier que l'utilisateur est un worker (role = WORKER)
 * - Vérifier que le worker est approuvé (workerStatus = APPROVED)
 * - Vérifier que le compte n'est pas soft-deleted
 * - Retourner les missions du worker
 * 
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 */
export class GetMyMissionsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly missionRepository: IMissionRepository
  ) {}

  /**
   * Exécuter le use case
   */
  async execute(input: GetMyMissionsInput): Promise<GetMyMissionsOutput> {
    const { workerId, skip = 0, take = 10 } = input;

    // -------------------------------------------------------------------------
    // ÉTAPE 1: Validation de l'input
    // -------------------------------------------------------------------------
    if (!workerId || typeof workerId !== 'string' || workerId.trim() === '') {
      throw BusinessErrors.badRequest(
        WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
        { workerId: 'ID du travailleur invalide ou manquant.' }
      );
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 2: Récupération du worker
    // -------------------------------------------------------------------------
    const worker = await this.userRepository.findById(workerId);

    // -------------------------------------------------------------------------
    // ÉTAPE 3: Vérification d'existence
    // -------------------------------------------------------------------------
    if (!worker) {
      throw BusinessErrors.notFound(WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 4: Vérification du rôle
    // -------------------------------------------------------------------------
    if (worker.role !== Role.WORKER) {
      throw BusinessErrors.forbidden(WORKER_VALIDATION_MESSAGES.WORKER_ACCESS_DENIED);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 5: Vérification que le worker est approuvé
    // -------------------------------------------------------------------------
    if (worker.workerStatus !== WorkerStatus.APPROVED) {
      throw BusinessErrors.forbidden(
        worker.workerStatus === WorkerStatus.PENDING
          ? WORKER_VALIDATION_MESSAGES.WORKER_INVALID_STATUS
          : WORKER_VALIDATION_MESSAGES.WORKER_REJECTED
      );
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 6: Vérification que le compte n'est pas soft-deleted
    // -------------------------------------------------------------------------
    if (worker.deletedAt !== null) {
      throw BusinessErrors.forbidden('Votre compte a été supprimé.');
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 7: Vérification que le worker n'est pas banni
    // -------------------------------------------------------------------------
    if (worker.isBanned) {
      throw BusinessErrors.forbidden('Votre compte a été banni.');
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 8: Récupération des missions
    // -------------------------------------------------------------------------
    const result = await this.missionRepository.findAllWithDetails(
      skip,
      take,
      undefined, // clientId - not needed
      workerId
    );

    return {
      missions: result.missions,
      total: result.total,
    };
  }
}
