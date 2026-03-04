// ============================================================================
// CANCEL MISSION USE CASE - APPLICATION LAYER
// ============================================================================
// Annule une mission
// Transition: Plusieurs statuts -> CANCELLED (sauf COMPLETED)
// ============================================================================
import { BusinessErrors } from '../../../shared/errors/index.js';
import { NotificationService } from '../../notification/index.js';
/**
 * Cancel Mission Use Case
 *
 * RESPONSABILITÉ:
 * - Annuler une mission
 * - Transitionner vers CANCELLED
 * - Possible depuis plusieurs statuts (sauf COMPLETED et CANCELLED)
 * - Vérifie que l'utilisateur est le client ou le worker de la mission
 * - Notifie les deux parties de l'annulation
 */
export class CancelMissionUseCase {
    missionRepository;
    notificationService;
    constructor(missionRepository, notificationService) {
        this.missionRepository = missionRepository;
        this.notificationService = notificationService;
    }
    /**
     * Exécute l'annulation de la mission
     * @param missionId - ID de la mission
     * @param userId - ID de l'utilisateur qui annule (pour vérification d'ownership)
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou ne peut pas être annulée
     */
    async execute(missionId, userId) {
        // Vérifier que l'ID de la mission est fourni
        if (!missionId || missionId.trim().length === 0) {
            throw BusinessErrors.badRequest('L\'ID de la mission est requis.');
        }
        // Récupérer la mission
        const mission = await this.missionRepository.findById(missionId);
        if (!mission) {
            throw BusinessErrors.notFound('Mission introuvable.');
        }
        // VÉRIFICATION D'OWNERSHIP: L'utilisateur doit être le client ou le worker
        if (mission.clientId !== userId && mission.workerId !== userId) {
            throw BusinessErrors.forbidden('Vous n\'êtes pas autorisé à annuler cette mission.');
        }
        // Vérifier que la mission peut être annulée
        if (!mission.canCancel()) {
            throw BusinessErrors.badRequest(`La mission ne peut pas être annulée. Statut actuel: ${mission.status}.`);
        }
        // Annuler la mission via l'entité
        const updatedMission = mission.cancel();
        // Sauvegarder en base de données
        await this.missionRepository.update(missionId, updatedMission);
        // Notifier les deux parties de l'annulation
        await this.notificationService.notifyMissionCancelled({
            missionId: missionId,
            clientId: mission.clientId,
            workerId: mission.workerId,
            clientName: mission.clientId, // TODO: Récupérer les noms
            workerName: mission.workerId,
        });
    }
}
//# sourceMappingURL=cancel-mission.usecase.js.map