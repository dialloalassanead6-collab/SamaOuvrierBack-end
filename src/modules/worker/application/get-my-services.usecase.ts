// ============================================================================
// USE CASE: Obtenir les services du worker connecté
// ============================================================================
// Ce use case permet à un worker de récupérer ses propres services.
// Sécurisé car l'ID vient du JWT.
// ============================================================================

import { Role, WorkerStatus } from '@prisma/client';
import type { IUserRepository } from '../../user/application/index.js';
import type { IServiceRepository } from '../../service/application/index.js';
import type { Service } from '../../service/domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES } from '../../../shared/constants/messages.js';

/**
 * Input DTO pour get-my-services
 */
export interface GetMyServicesInput {
  /** ID du worker (extrait du JWT) */
  workerId: string;
  /** Nombre d'enregistrements à ignorer */
  skip?: number;
  /** Nombre d'enregistrements à récupérer */
  take?: number;
}

/**
 * Output DTO pour get-my-services
 */
export interface GetMyServicesOutput {
  /** Liste des services */
  services: Service[];
  /** Nombre total */
  total: number;
}

/**
 * Use Case: Obtenir les services du worker connecté
 * 
 * RESPONSABILITÉS:
 * - Vérifier que le worker existe
 * - Vérifier que l'utilisateur est un worker (role = WORKER)
 * - Vérifier que le worker est approuvé (workerStatus = APPROVED)
 * - Vérifier que le compte n'est pas soft-deleted
 * - Retourner les services du worker
 * 
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 */
export class GetMyServicesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  /**
   * Exécuter le use case
   */
  async execute(input: GetMyServicesInput): Promise<GetMyServicesOutput> {
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
    // ÉTAPE 8: Récupération des services
    // -------------------------------------------------------------------------
    const result = await this.serviceRepository.findAll(workerId, skip, take);

    return {
      services: result.services,
      total: result.total,
    };
  }
}
