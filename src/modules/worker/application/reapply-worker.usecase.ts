// ============================================================================
// USE CASE: Refaire une demande de validation (Reapply)
// ============================================================================
// Ce use case permet à un travailleur rejeté de refaire une demande.
// Sécurisé avec toutes les vérifications métier obligatoires.
// ============================================================================

import { Role, WorkerStatus } from '@prisma/client';
import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES, USER_MESSAGES } from '../../../shared/constants/messages.js';

/**
 * Paramètres d'entrée pour le use case ReapplyWorker
 */
export interface ReapplyWorkerInput {
  /** ID du travailleur qui fait la demande (extrait du JWT) */
  workerId: string;
}

/**
 * Résultat du use case ReapplyWorker
 */
export interface ReapplyWorkerOutput {
  /** Utilisateur avec le nouveau statut */
  user: User;
  /** Message de succès */
  message: string;
}

/**
 * Use case pour refaire une demande de validation
 * 
 * RESPONSABILITÉS:
 * - Vérifier que le travailleur existe
 * - Vérifier que l'utilisateur est un travailleur (role = WORKER)
 * - Vérifier que le travailleur n'est pas banni (isBanned = false)
 * - Vérifier que le compte n'est pas soft-deleted (deletedAt = null)
 * - Vérifier que le travailleur est rejeté (workerStatus = REJECTED)
 * - Remettre le travailleur en attente (workerStatus = PENDING)
 * - Réinitialiser rejectionReason à null
 * 
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 * - Toutes les conditions d'accès sont vérifiées AVANT toute modification
 */
export class ReapplyWorkerUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Exécuter le use case
   * 
   * Ordre des vérifications (du plus simple au plus complexe):
   * 1. Validation basique de l'input
   * 2. Existence du worker
   * 3. Vérification du rôle
   * 4. Vérifications de sécurité (banni, supprimé)
   * 5. Vérification du statut actuel
   */
  async execute(input: ReapplyWorkerInput): Promise<ReapplyWorkerOutput> {
    const { workerId } = input;

    // -------------------------------------------------------------------------
    // ÉTAPE 1: Validation de l'input
    // -------------------------------------------------------------------------
    // Le workerId ne doit jamais provenir du body de la requête.
    // Il est extrait du JWT par le middleware d'authentification.
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
    // ÉTAPE 3: Vérification d'existence - 404 Not Found
    // -------------------------------------------------------------------------
    if (!worker) {
      throw BusinessErrors.notFound(WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 4: Vérification du rôle - Doit être WORKER
    // -------------------------------------------------------------------------
    if (worker.role !== Role.WORKER) {
      throw BusinessErrors.forbidden(WORKER_VALIDATION_MESSAGES.WORKER_ACCESS_DENIED);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 5: Vérification de sécurité - Compte banni (403 Forbidden)
    // -------------------------------------------------------------------------
    // Un worker banni ne peut pas refaire une demande.
    // C'est une erreur 403 car l'identité est valide mais l'accès est interdit.
    if (worker.isBanned === true) {
      throw BusinessErrors.forbidden(USER_MESSAGES.USER_IS_BANNED);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 6: Vérification de sécurité - Compte soft-deleted (403 Forbidden)
    // -------------------------------------------------------------------------
    // Un compte soft-deleted ne peut pas effectuer d'actions.
    // C'est une erreur 403 car l'identité est valide mais le compte est inactif.
    if (worker.deletedAt !== null) {
      throw BusinessErrors.forbidden(USER_MESSAGES.USER_IS_DELETED);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 7: Vérification du statut actuel - Doit être REJECTED (403 Forbidden)
    // -------------------------------------------------------------------------
    // Un worker peut refaire une demande UNIQUEMENT s'il a été rejeté.
    // Si le statut est PENDING ou APPROVED, c'est une erreur 403 (accès interdit).
    // L'erreur 400 n'est pas appropriée ici car le problème n'est pas une donnée
    // invalide mais une condition d'accès non remplie.
    
    if (worker.workerStatus === WorkerStatus.APPROVED) {
      throw BusinessErrors.forbidden(WORKER_VALIDATION_MESSAGES.WORKER_ALREADY_APPROVED);
    }

    if (worker.workerStatus === WorkerStatus.PENDING) {
      throw BusinessErrors.forbidden(WORKER_VALIDATION_MESSAGES.WORKER_INVALID_STATUS);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 8: Vérification finale - Doit être REJECTED pour continuer
    // -------------------------------------------------------------------------
    // Cette vérification est redondante avec les deux précédentes mais
    // explicite l'intention métier pour la maintenabilité du code.
    if (worker.workerStatus !== WorkerStatus.REJECTED) {
      throw BusinessErrors.forbidden(WORKER_VALIDATION_MESSAGES.WORKER_NOT_REJECTED);
    }

    // -------------------------------------------------------------------------
    // ÉTAPE 9: Mise à jour du statut vers PENDING
    // -------------------------------------------------------------------------
    // Toutes les vérifications sont passées, on peut maintenant
    // remettre le worker en attente et réinitialiser la raison du rejet.
    const updatedWorker = await this.userRepository.updateWorkerStatus(
      workerId,
      WorkerStatus.PENDING,
      null // Réinitialise rejectionReason à null
    );

    return {
      user: updatedWorker,
      message: WORKER_VALIDATION_MESSAGES.WORKER_REAPPLY_SUCCESS,
    };
  }
}
