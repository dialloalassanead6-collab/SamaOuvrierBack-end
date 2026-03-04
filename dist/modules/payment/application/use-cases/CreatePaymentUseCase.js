// ============================================================================
// CREATE PAYMENT USE CASE - APPLICATION LAYER
// ============================================================================
// Crée un paiement initial pour une mission avec escrow
// Transition: PENDING_PAYMENT → PENDING_ACCEPT
// ============================================================================
import { BusinessErrors } from '../../../../shared/errors/business-error.js';
import { MissionStatus } from '../../../mission/domain/index.js';
import { EscrowDomainService } from '../../domain/index.js';
/**
 * Create Payment Use Case
 *
 * RESPONSABILITÉ:
 * - Créer un Payment et un Escrow pour une mission
 * - Initialiser le paiement via PayTech
 * - Bloquer les fonds en escrow
 * - Transitioner le statut de la mission
 *
 * SCÉNARIO:
 * 1. Vérifier que la mission existe et est en attente de paiement
 * 2. Vérifier que le client est bien le propriétaire
 * 3. Créer le Payment et l'Escrow
 * 4. Initialiser le paiement PayTech
 * 5. Mettre à jour le statut de la mission
 */
export class CreatePaymentUseCase {
    paymentRepository;
    missionRepository;
    paytechService;
    escrowDomainService;
    constructor(paymentRepository, missionRepository, paytechService, escrowDomainService) {
        this.paymentRepository = paymentRepository;
        this.missionRepository = missionRepository;
        this.paytechService = paytechService;
        this.escrowDomainService = escrowDomainService;
    }
    /**
     * Exécute la création du paiement
     */
    async execute(input) {
        // 1. Vérifier que la mission existe
        const mission = await this.missionRepository.findById(input.missionId);
        if (!mission) {
            throw BusinessErrors.notFound('Mission introuvable.');
        }
        // 2. Vérifier que la mission est en attente de paiement
        if (mission.status !== MissionStatus.PENDING_PAYMENT) {
            throw BusinessErrors.badRequest(`La mission n'est pas en attente de paiement. Statut actuel: ${mission.status}`);
        }
        // 3. Vérifier que le client est bien le propriétaire
        if (mission.clientId !== input.clientId) {
            throw BusinessErrors.forbidden('Vous n\'êtes pas le client de cette mission.');
        }
        // 4. Vérifier l'idempotence - éviter les doubles paiements
        const existingPayment = await this.paymentRepository.findPaymentByMissionId(input.missionId);
        if (existingPayment && existingPayment.status === 'SUCCESS') {
            throw BusinessErrors.conflict('Un paiement a déjà été effectué pour cette mission.');
        }
        // 5. Créer le Payment et l'Escrow via le service de domaine
        const amount = Number(mission.prixMin); // Utiliser le prix minimum pour le paiement initial
        const idempotencyKey = this.paytechService.generateIdempotencyKey(`mission-${input.missionId}`);
        const { payment, escrow } = this.escrowDomainService.holdFunds(input.missionId, input.clientId, mission.workerId, amount);
        // 6. Sauvegarder en base de données
        const saved = await this.paymentRepository.savePaymentWithEscrow(payment, escrow);
        // 7. Initialiser le paiement PayTech
        const paymentUrl = await this.paytechService.createPaymentRequest(amount, idempotencyKey, `Paiement mission ${input.missionId}`, {
            missionId: input.missionId,
            clientId: input.clientId,
            workerId: mission.workerId,
        });
        // 8. Mettre à jour le statut de la mission (sera fait via webhook ou confirmation)
        // Note: La transition vers PENDING_ACCEPT se fait via confirm-initial-payment
        return {
            paymentId: saved.payment.id,
            escrowId: saved.escrow.id,
            paymentUrl,
            amount,
        };
    }
}
//# sourceMappingURL=CreatePaymentUseCase.js.map