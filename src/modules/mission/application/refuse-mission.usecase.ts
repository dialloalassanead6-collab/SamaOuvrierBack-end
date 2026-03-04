// ============================================================================
// REFUSE MISSION USE CASE - APPLICATION LAYER
// ============================================================================
// Permet au worker de refuser une mission en attente
// Transition: PENDING_ACCEPT → REFUSED
// NOTE: Le module Payment sera notifié pour remboursement total
// ============================================================================

import type { IMissionRepository } from './mission.repository.interface.js';
import { type MissionResponse, type MissionRefusedEvent } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { NotificationService } from '../../notification/index.js';

/**
 * Refuse Mission Use Case
 * 
 * RESPONSABILITÉ:
 * - Permet au worker de refuser une mission
 * - Vérifie que le worker est bien assigné à la mission
 * - Met à jour le statut en REFUSED
 * - Notifie le client du refus
 * - Déclenche le remboursement via le module Payment
 */
export class RefuseMissionUseCase {
  private readonly missionRepository: IMissionRepository;
  private readonly notificationService: NotificationService;

  constructor(missionRepository: IMissionRepository, notificationService: NotificationService) {
    this.missionRepository = missionRepository;
    this.notificationService = notificationService;
  }

  /**
   * Exécute le refus de la mission
   * @param missionId - ID de la mission à refuser
   * @param workerId - ID du worker qui refuse (doit correspondre au worker assigné)
   * @returns La mission mise à jour
   * @throws BusinessError si la mission n'existe pas ou n'est pas en attente d'acceptation
   */
  async execute(missionId: string, workerId: string): Promise<{ mission: MissionResponse; event: MissionRefusedEvent }> {
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
    const updatedMissionEntity = mission.refuseMission();

    // Sauvegarder en base de données
    const updatedMission = await this.missionRepository.update(
      missionId,
      updatedMissionEntity
    );

    // Envoyer une notification au client
    await this.notificationService.notifyMissionRefused({
      missionId: updatedMission.id,
      clientId: updatedMission.clientId,
      workerId: updatedMission.workerId,
      workerName: workerId, // TODO: Récupérer le nom du worker
    });

    // Créer l'événement pour notification Payment (remboursement)
    const event: MissionRefusedEvent = {
      type: 'MISSION_REFUSED',
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
