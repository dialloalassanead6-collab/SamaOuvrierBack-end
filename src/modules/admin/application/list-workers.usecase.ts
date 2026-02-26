// ============================================================================
// USE CASE: Liste des travailleurs avec filtre par statut
// ============================================================================
// Ce use case permet à l'admin de lister les travailleurs avec un filtre
// optionnel par statut (PENDING, APPROVED, REJECTED).
// ============================================================================

import { WorkerStatus } from '@prisma/client';
import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
import { BusinessError } from '../../../shared/errors/index.js';
import { HTTP_STATUS, ERROR_CODES } from '../../../shared/constants/messages.js';

/**
 * Paramètres d'entrée pour le use case ListWorkers
 */
export interface ListWorkersInput {
  /** Statut du worker (optionnel) */
  status?: WorkerStatus | undefined;
  /** Nombre d'éléments à ignorer (pagination) */
  skip?: number;
  /** Nombre d'éléments à récupérer (pagination) */
  take?: number;
}

/**
 * Résultat du use case ListWorkers
 */
export interface ListWorkersOutput {
  /** Liste des utilisateurs travailleurs */
  users: User[];
  /** Nombre total de travailleurs */
  total: number;
  /** Statut filtré (si fourni) */
  status?: WorkerStatus | undefined;
}

/**
 * Use case pour lister les travailleurs avec filtre optionnel par statut
 * 
 * RESPONSABILITÉS:
 * - Valider les paramètres d'entrée
 * - Récupérer les travailleurs selon le filtre
 * - Retourner la liste paginée
 */
export class ListWorkersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Exécuter le use case
   */
  async execute(input: ListWorkersInput): Promise<ListWorkersOutput> {
    const { status, skip = 0, take = 20 } = input;

    // Validation des paramètres de pagination
    if (skip < 0) {
      throw new BusinessError({
        message: 'Le paramètre skip doit être positif.',
        statusCode: HTTP_STATUS.BAD_REQUEST,
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    if (take < 1 || take > 100) {
      throw new BusinessError({
        message: 'Le paramètre take doit être entre 1 et 100.',
        statusCode: HTTP_STATUS.BAD_REQUEST,
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    let result;

    if (status) {
      // Valider le statut
      if (!Object.values(WorkerStatus).includes(status)) {
        throw new BusinessError({
          message: `Statut invalide. Les valeurs possibles sont: ${Object.values(WorkerStatus).join(', ')}`,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          code: ERROR_CODES.INVALID_INPUT,
        });
      }

      result = await this.userRepository.findWorkersByStatus(status, skip, take);
    } else {
      // Pas de filtre - retourner tous les travailleurs
      result = await this.userRepository.findAllWorkers(skip, take);
    }

    return {
      users: result.users,
      total: result.total,
      status,
    };
  }
}
