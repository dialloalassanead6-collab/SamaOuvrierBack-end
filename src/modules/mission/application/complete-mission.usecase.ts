// ============================================================================
// COMPLETE MISSION USE CASE - APPLICATION LAYER
// ============================================================================
// Marque une mission comme terminée avec double confirmation
// Transition: IN_PROGRESS -> COMPLETED (après confirmation des deux parties)
// ============================================================================

import type { IMissionRepository } from './mission.repository.interface.js';
import { MissionStatus, type MissionResponse, type MissionCompletedEvent } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { NotificationService } from '../../notification/index.js';

/**
 * Input pour la complétion de mission
 */
export interface CompleteMissionInput {
  userId: string;
  userRole: 'CLIENT' | 'WORKER';
}

/**
 * Complete Mission Use Case
 * 
 * RESPONSABILITÉ:
 * - Permet au client ou worker de confirmer la complétion de la mission
 * - Nécessite confirmation des deux parties pour passer à COMPLETED
 * - Envoie une notification quand la mission est terminée
 */
export class CompleteMissionUseCase {
  private readonly missionRepository: IMissionRepository;
  private readonly notificationService: NotificationService;

  constructor(missionRepository: IMissionRepository, notificationService: NotificationService) {
    this.missionRepository = missionRepository;
    this.notificationService = notificationService;
  }

  /**
   * Exécute la complétion de la mission
   * @param missionId - ID de la mission
   * @param input - ID et rôle de l'utilisateur qui confirme
   * @returns La mission mise à jour et l'événement (si complétée)
   * @throws BusinessError si la mission n'existe pas ou ne peut pas être terminée
   */
  async execute(
    missionId: string, 
    input: CompleteMissionInput
  ): Promise<{ mission: MissionResponse; event?: MissionCompletedEvent } | void> {
    // Vérifier que l'ID de la mission est fourni
    if (!missionId || missionId.trim().length === 0) {
      throw BusinessErrors.badRequest('L\'ID de la mission est requis.');
    }

    // Récupérer la mission
    const mission = await this.missionRepository.findById(missionId);

    if (!mission) {
      throw BusinessErrors.notFound('Mission introuvable.');
    }

    // Vérifier que la mission est en cours
    if (mission.status !== MissionStatus.IN_PROGRESS) {
      throw BusinessErrors.badRequest(
        `La mission ne peut pas être confirmée. Statut actuel: ${mission.status}. ` +
        'La mission doit être en cours pour être confirmée.'
      );
    }

    // Vérifier que l'utilisateur est le client ou le worker de la mission
    const isClient = input.userRole === 'CLIENT' && mission.clientId === input.userId;
    const isWorker = input.userRole === 'WORKER' && mission.workerId === input.userId;

    if (!isClient && !isWorker) {
      throw BusinessErrors.forbidden('Vous ne pouvez pas confirmer cette mission.');
    }

    // Appliquer la confirmation appropriée
    let updatedMissionEntity;
    let event: MissionCompletedEvent | undefined;

    if (isClient) {
      updatedMissionEntity = mission.completeByClient();
      
      // Si la mission est maintenant terminée (les deux ont confirmé)
      if (updatedMissionEntity.isCompleted()) {
        event = {
          type: 'MISSION_COMPLETED',
          payload: {
            missionId: updatedMissionEntity.id,
            clientId: updatedMissionEntity.clientId,
            workerId: updatedMissionEntity.workerId,
            prixFinal: updatedMissionEntity.prixFinal ?? 0,
            status: updatedMissionEntity.status,
            completedAt: updatedMissionEntity.updatedAt,
          },
        };
      }
    } else {
      updatedMissionEntity = mission.completeByWorker();
      
      // Si la mission est maintenant terminée (les deux ont confirmé)
      if (updatedMissionEntity.isCompleted()) {
        event = {
          type: 'MISSION_COMPLETED',
          payload: {
            missionId: updatedMissionEntity.id,
            clientId: updatedMissionEntity.clientId,
            workerId: updatedMissionEntity.workerId,
            prixFinal: updatedMissionEntity.prixFinal ?? 0,
            status: updatedMissionEntity.status,
            completedAt: updatedMissionEntity.updatedAt,
          },
        };
      }
    }

    // Sauvegarder en base de données
    const updatedMission = await this.missionRepository.update(
      missionId, 
      updatedMissionEntity
    );

    // Si la mission est terminée, envoyer une notification au client
    if (event) {
      await this.notificationService.notifyMissionCompleted({
        missionId: updatedMission.id,
        clientId: updatedMission.clientId,
        workerId: updatedMission.workerId,
        workerName: updatedMission.workerId, // TODO: Récupérer le nom du worker
      });
    }

    if (event) {
      return {
        mission: updatedMission.toResponse(),
        event,
      };
    }

    return {
      mission: updatedMission.toResponse(),
    };
  }
}
