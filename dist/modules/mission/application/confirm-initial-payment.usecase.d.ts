import type { IMissionRepository } from './mission.repository.interface.js';
/**
 * Confirm Initial Payment Use Case
 *
 * RESPONSABILITÉ:
 * - Confirmer le paiement initial après validation externe (pas de PayTech ici)
 * - Déverrouiller les coordonnées du worker pour le client
 * - Transitionner le statut de PENDING_PAYMENT à CONTACT_UNLOCKED
 * - Vérifie que seul le CLIENT peut confirmer le paiement initial
 */
export declare class ConfirmInitialPaymentUseCase {
    private readonly missionRepository;
    constructor(missionRepository: IMissionRepository);
    /**
     * Exécute la confirmation du paiement initial
     * @param missionId - ID de la mission
     * @param userId - ID de l'utilisateur qui confirme (doit être le client)
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou si le paiement ne peut pas être confirmé
     */
    execute(missionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=confirm-initial-payment.usecase.d.ts.map