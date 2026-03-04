// ============================================================================
// ACCEPT MISSION USE CASE - APPLICATION LAYER
// ============================================================================
// Permet au worker d'accepter une mission en attente
// Transition: PENDING_ACCEPT → CONTACT_UNLOCKED
// ============================================================================

import type { IMissionRepository } from './mission.repository.interface.js';
import { type MissionResponse, type MissionAcceptedEvent } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { NotificationService } from '../../notification/index.js';

/**
 * Accept Mission Use Case
 * 
 * RESPONSABILITÉ:
 * - Permet au worker d'accepter une mission
 * - Vérifie que le worker est bien assigné à la mission
 * - Met à jour le statut en CONTACT_UNLOCKED
 * - Envoie une notification au client
 */
export class AcceptMissionUseCase {
  private readonly missionRepository: IMissionRepository;
  private readonly notificationService: NotificationService;

  constructor(missionRepository: IMissionRepository, notificationService: NotificationService) {
    this.missionRepository = missionRepository;
    this.notificationService = notificationService;
  }

  /**
   * Exécute l'acceptation de la mission
   * @param missionId - ID de la mission à accepter
   * @param workerId - ID du worker qui accepte (doit correspondre au worker assigné)
   * @returns La mission mise à jour
   * @throws BusinessError si la mission n'existe pas ou n'est pas en attente d'acceptation
   */
  async execute(missionId: string, workerId: string): Promise<{ mission: MissionResponse; event: MissionAcceptedEvent }> {
    // Récupérer la mission existante
    const mission = await this.missionRepository.findById(missionId);

    if (!mission) {
      throw BusinessErrors.notFound('Mission introuvable.');
    }

    // Vérifier que le worker est bien assigné à cette mission
    if (mission.workerId !== workerId) {
      throw BusinessErrors.forbidden('Vous n\'êtes pas assigné à cette mission.');
    }

    // Vérifier que la mission est en attente d'acceptation
    if (!mission.isPendingAccept()) {
      throw BusinessErrors.badRequest(
        `La mission n'est pas en attente d'acceptation. Statut actuel: ${mission.status}`
      );
    }

    // Utiliser l'entité pour la transition de statut
    const updatedMissionEntity = mission.acceptMission();

    // Sauvegarder en base de données
    const updatedMission = await this.missionRepository.update(
      missionId,
      updatedMissionEntity
    );

    // Envoyer une notification au client
    await this.notificationService.notifyMissionAccepted({
      missionId: updatedMission.id,
      clientId: updatedMission.clientId,
      workerId: updatedMission.workerId,
      workerName: workerId, // TODO: Récupérer le nom du worker via le user repository
    });

    // Créer l'événement pour notification future
    const event: MissionAcceptedEvent = {
      type: 'MISSION_ACCEPTED',
      payload: {
        missionId: updatedMission.id,
        clientId: updatedMission.clientId,
        workerId: updatedMission.workerId,
        status: updatedMission.status,
        updatedAt: updatedMission.updatedAt,
      },
    };

    return {
      mission: updatedMission.toResponse(),
      event,
    };
  }
}
