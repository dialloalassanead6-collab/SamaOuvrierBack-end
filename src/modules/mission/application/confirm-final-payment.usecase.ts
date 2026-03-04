// ============================================================================
// CONFIRM FINAL PAYMENT USE CASE - APPLICATION LAYER
// ============================================================================
// Confirme le paiement final d'une mission
// Transition: AWAITING_FINAL_PAYMENT -> IN_PROGRESS
//            OU NEGOTIATION_DONE -> IN_PROGRESS (si prixFinal === prixMin)
// ============================================================================

import type { IMissionRepository } from './mission.repository.interface.js';
import { MissionStatus } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';

/**
 * Confirm Final Payment Use Case
 * 
 * RESPONSABILITÉ:
 * - Confirmer le paiement final après validation externe
 * - Transitionner vers IN_PROGRESS
 * - À appeler uniquement après confirmation du paiement par le système de paiement externe
 * - Vérifie que seul le CLIENT peut confirmer le paiement final
 */
export class ConfirmFinalPaymentUseCase {
  private readonly missionRepository: IMissionRepository;

  constructor(missionRepository: IMissionRepository) {
    this.missionRepository = missionRepository;
  }

  /**
   * Exécute la confirmation du paiement final
   * @param missionId - ID de la mission
   * @param userId - ID de l'utilisateur qui confirme (doit être le client)
   * @returns La mission mise à jour
   * @throws BusinessError si la mission n'existe pas ou si le paiement ne peut pas être confirmé
   */
  async execute(missionId: string, userId: string): Promise<void> {
    // Vérifier que l'ID de la mission est fourni
    if (!missionId || missionId.trim().length === 0) {
      throw BusinessErrors.badRequest('L\'ID de la mission est requis.');
    }

    // Récupérer la mission
    const mission = await this.missionRepository.findById(missionId);

    if (!mission) {
      throw BusinessErrors.notFound('Mission introuvable.');
    }

    // VÉRIFICATION D'OWNERSHIP: Seul le CLIENT peut confirmer le paiement final
    if (mission.clientId !== userId) {
      throw BusinessErrors.forbidden('Seul le client peut confirmer le paiement final.');
    }

    // Vérifier que la mission est dans un statut permettant la confirmation du paiement final
    const canConfirmFromStatus = 
      mission.status === MissionStatus.AWAITING_FINAL_PAYMENT ||
      (mission.status === MissionStatus.NEGOTIATION_DONE && mission.prixFinal === mission.prixMin);

    if (!canConfirmFromStatus) {
      throw BusinessErrors.badRequest(
        `Le paiement final ne peut pas être confirmé. Statut actuel: ${mission.status}. ` +
        'La mission doit être en attente du paiement final.'
      );
    }

    // Confirmer le paiement final via l'entité
    const updatedMission = mission.confirmFinalPayment();

    // Sauvegarder en base de données
    await this.missionRepository.update(missionId, updatedMission);
  }
}
