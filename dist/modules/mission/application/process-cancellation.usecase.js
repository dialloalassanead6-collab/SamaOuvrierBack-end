// ============================================================================
// PROCESS CANCELLATION USE CASE - APPLICATION LAYER
// ============================================================================
// Traite une demande d'annulation (approuve ou rejette)
// Transition: CANCEL_REQUESTED -> CANCELLED (approuvé)
//             CANCEL_REQUESTED -> IN_PROGRESS (rejeté)
// ============================================================================
import { Mission } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
/**
 * Process Cancellation Use Case
 *
 * RESPONSABILITÉ:
 * - Traiter une demande d'annulation en attente
 * - Approuver: transitionne vers CANCELLED (nécessite validation Escrow)
 * - Rejeter: transitionne vers IN_PROGRESS (reprise de la mission)
 * - Accessible uniquement par l'autre partie (pas celle qui a demandé)
 */
export class ProcessCancellationUseCase {
    missionRepository;
    constructor(missionRepository) {
        this.missionRepository = missionRepository;
    }
    /**
     * Exécute le traitement de l'annulation
     * @param missionId - ID de la mission
     * @param input - Décision d'approuver ou rejeter
     * @param userId - ID de l'utilisateur qui traite la demande
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou ne peut pas être traitée
     */
    async execute(missionId, input, userId) {
        // Vérifier que l'ID de la mission est fourni
        if (!missionId || missionId.trim().length === 0) {
            throw BusinessErrors.badRequest('L\'ID de la mission est requis.');
        }
        // Récupérer la mission
        const mission = await this.missionRepository.findById(missionId);
        if (!mission) {
            throw BusinessErrors.notFound('Mission introuvable.');
        }
        // Vérifier que la mission est en attente d'annulation
        if (!mission.isCancellationRequested()) {
            throw BusinessErrors.badRequest(`Aucune demande d'annulation en attente. Statut actuel: ${mission.status}.`);
        }
        // Vérifier que l'utilisateur n'est pas celui qui a demandé l'annulation
        // Si CLIENT a demandé, WORKER doit approuver/rejeter et vice versa
        if (mission.cancellationRequestedBy === 'CLIENT' && mission.clientId === userId) {
            throw BusinessErrors.forbidden('Vous ne pouvez pas traiter votre propre demande d\'annulation.');
        }
        if (mission.cancellationRequestedBy === 'WORKER' && mission.workerId === userId) {
            throw BusinessErrors.forbidden('Vous ne pouvez pas traiter votre propre demande d\'annulation.');
        }
        // Traiter selon la décision
        let updatedMission;
        if (input.approved) {
            // Approuver l'annulation -> CANCELLED
            // NOTE: Dans un vrai système Escrow, des vérifications supplémentaires seraient nécessaires
            // pour gérer le remboursement, les pénalités, etc.
            updatedMission = mission.approveCancellation();
        }
        else {
            // Rejeter l'annulation -> reprendre IN_PROGRESS
            updatedMission = mission.rejectCancellation();
        }
        // Sauvegarder en base de données
        await this.missionRepository.update(missionId, updatedMission);
        return updatedMission.toResponse();
    }
}
//# sourceMappingURL=process-cancellation.usecase.js.map