// ============================================================================
// CONFIRM INITIAL PAYMENT USE CASE - APPLICATION LAYER
// ============================================================================
// Confirme le paiement initial d'une mission
// Transition: PENDING_PAYMENT -> CONTACT_UNLOCKED
// ============================================================================
import { MissionStatus } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
/**
 * Confirm Initial Payment Use Case
 *
 * RESPONSABILITÉ:
 * - Confirmer le paiement initial après validation externe (pas de PayTech ici)
 * - Déverrouiller les coordonnées du worker pour le client
 * - Transitionner le statut de PENDING_PAYMENT à CONTACT_UNLOCKED
 * - Vérifie que seul le CLIENT peut confirmer le paiement initial
 */
export class ConfirmInitialPaymentUseCase {
    missionRepository;
    constructor(missionRepository) {
        this.missionRepository = missionRepository;
    }
    /**
     * Exécute la confirmation du paiement initial
     * @param missionId - ID de la mission
     * @param userId - ID de l'utilisateur qui confirme (doit être le client)
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou si le paiement ne peut pas être confirmé
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
        // VÉRIFICATION D'OWNERSHIP: Seul le CLIENT peut confirmer le paiement initial
        if (mission.clientId !== userId) {
            throw BusinessErrors.forbidden('Seul le client peut confirmer le paiement initial.');
        }
        // Vérifier que la mission est dans le bon statut
        if (mission.status !== MissionStatus.PENDING_PAYMENT) {
            throw BusinessErrors.badRequest(`Le paiement initial ne peut pas être confirmé. Statut actuel: ${mission.status}. ` +
                'La mission doit être en attente de paiement initial.');
        }
        // Confirmer le paiement initial (via l'entité - machine à états)
        const updatedMission = mission.confirmInitialPayment();
        // Sauvegarder en base de données
        await this.missionRepository.update(missionId, updatedMission);
    }
}
//# sourceMappingURL=confirm-initial-payment.usecase.js.map