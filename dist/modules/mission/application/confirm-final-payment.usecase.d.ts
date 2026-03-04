import type { IMissionRepository } from './mission.repository.interface.js';
/**
 * Confirm Final Payment Use Case
 *
 * RESPONSABILITÉ:
 * - Confirmer le paiement final après validation externe
 * - Transitionner vers IN_PROGRESS
 * - À appeler uniquement après confirmation du paiement par le système de paiement externe
 * - Vérifie que seul le CLIENT peut confirmer le paiement final
 */
export declare class ConfirmFinalPaymentUseCase {
    private readonly missionRepository;
    constructor(missionRepository: IMissionRepository);
    /**
     * Exécute la confirmation du paiement final
     * @param missionId - ID de la mission
     * @param userId - ID de l'utilisateur qui confirme (doit être le client)
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou si le paiement ne peut pas être confirmé
     */
    execute(missionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=confirm-final-payment.usecase.d.ts.map