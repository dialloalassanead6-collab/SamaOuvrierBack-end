// ============================================================================
// REQUEST CANCELLATION USE CASE - APPLICATION LAYER
// ============================================================================
// Demande l'annulation d'une mission en cours
// Transition: IN_PROGRESS -> CANCEL_REQUESTED
// ============================================================================

import type { IMissionRepository } from './mission.repository.interface.js';
import { type RequestCancellationInput, type MissionResponse } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';

/**
 * Request Cancellation Use Case
 * 
 * RESPONSABILITÉ:
 * - Permettre au client ou au worker de demander l'annulation d'une mission en cours
 * - Transitionner vers CANCEL_REQUESTED pour validation Escrow ultérieure
 * - Enregistrer qui a demandé l'annulation
 */
export class RequestCancellationUseCase {
  private readonly missionRepository: IMissionRepository;

  constructor(missionRepository: IMissionRepository) {
    this.missionRepository = missionRepository;
  }

  /**
   * Exécute la demande d'annulation
   * @param missionId - ID de la mission
   * @param input - Informations sur qui demande l'annulation
   * @returns La mission mise à jour
   * @throws BusinessError si la mission n'existe pas ou ne peut pas être annulée
   */
  async execute(missionId: string, input: RequestCancellationInput): Promise<MissionResponse> {
    // Vérifier que l'ID de la mission est fourni
    if (!missionId || missionId.trim().length === 0) {
      throw BusinessErrors.badRequest('L\'ID de la mission est requis.');
    }

    // Valider le demandeur
    if (!input.requester || !['CLIENT', 'WORKER'].includes(input.requester)) {
      throw BusinessErrors.badRequest('Le demandeur doit être CLIENT ou WORKER.');
    }

    // Récupérer la mission
    const mission = await this.missionRepository.findById(missionId);

    if (!mission) {
      throw BusinessErrors.notFound('Mission introuvable.');
    }

    // Vérifier que la mission est en cours
    if (!mission.canRequestCancellation()) {
      throw BusinessErrors.badRequest(
        `La mission ne peut pas être annulée. Statut actuel: ${mission.status}. ` +
        'Seules les missions en cours peuvent faire l\'objet d\'une demande d\'annulation.'
      );
    }

    // Demander l'annulation via l'entité (machine à états)
    const updatedMission = mission.requestCancellation(input.requester);

    // Sauvegarder en base de données
    await this.missionRepository.update(missionId, updatedMission);

    return updatedMission.toResponse();
  }
}
