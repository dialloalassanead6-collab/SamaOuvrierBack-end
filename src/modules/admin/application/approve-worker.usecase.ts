// ============================================================================
// USE CASE: Approuver un travailleur
// ============================================================================
// Ce use case permet à l'admin d'approuver un travailleur en attente.
// ============================================================================

import { Role, WorkerStatus } from '@prisma/client';
import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
import { BusinessError } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES, HTTP_STATUS, ERROR_CODES } from '../../../shared/constants/messages.js';
import { NotificationService } from '../../notification/index.js';

/**
 * Paramètres d'entrée pour le use case ApproveWorker
 */
export interface ApproveWorkerInput {
  /** ID du travailleur à approuver */
  workerId: string;
}

/**
 * Résultat du use case ApproveWorker
 */
export interface ApproveWorkerOutput {
  /** Utilisateur approuvé */
  user: User;
  /** Message de succès */
  message: string;
}

/**
 * Use case pour approuver un travailleur
 * 
 * RESPONSABILITÉS:
 * - Vérifier que le travailleur existe
 * - Vérifier que l'utilisateur est un travailleur (role = WORKER)
 * - Vérifier que le travailleur est en attente (workerStatus = PENDING)
 * - Approuver le travailleur (workerStatus = APPROVED)
 * - Réinitialiser rejectionReason à null
 * -Notifier le worker de la validation
 */
export class ApproveWorkerUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly notificationService: NotificationService
  ) {}

  /**
   * Exécuter le use case
   */
  async execute(input: ApproveWorkerInput): Promise<ApproveWorkerOutput> {
    const { workerId } = input;

    // Vérifier que l'ID est fourni
    if (!workerId) {
      throw new BusinessError({
        message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    // Récupérer le travailleur
    const worker = await this.userRepository.findById(workerId);

    // Vérifier que le travailleur existe
    if (!worker) {
      throw new BusinessError({
        message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
        code: ERROR_CODES.NOT_FOUND,
      });
    }

    // Vérifier que c'est un travailleur
    if (worker.role !== Role.WORKER) {
      throw new BusinessError({
        message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    // Vérifier qu'il est en attente
    if (worker.workerStatus !== WorkerStatus.PENDING) {
      throw new BusinessError({
        message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_PENDING,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        code: ERROR_CODES.INVALID_INPUT,
      });
    }

    // Approuver le travailleur
    const updatedWorker = await this.userRepository.updateWorkerStatus(
      workerId,
      WorkerStatus.APPROVED,
      null
    );

    // Notifier le worker de la validation de son compte
    try {
      await this.notificationService.notifyAccountValidated({
        userId: workerId,
      });
    } catch (notificationError) {
      // Log l'erreur mais ne pas bloquer l'approbation
      console.error('Erreur lors de l\'envoi de la notification:', notificationError);
    }

    return {
      user: updatedWorker,
      message: WORKER_VALIDATION_MESSAGES.WORKER_APPROVED,
    };
  }
}
