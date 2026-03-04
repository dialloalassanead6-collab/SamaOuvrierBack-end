// ============================================================================
// HANDLE FINAL PAYMENT WEBHOOK USE CASE - APPLICATION LAYER
// ============================================================================
// Traite les webhooks PayTech pour le paiement final (supplementary payment)
// Gère la vérification de signature et la mise à jour des statuts
// ============================================================================
import { BusinessErrors } from '../../../../shared/errors/business-error.js';
import { MissionStatus } from '../../../mission/domain/index.js';
import { PaymentStatus } from '../../domain/enums/PaymentStatus.js';
import { EscrowStatus } from '../../domain/enums/EscrowStatus.js';
import { paytechWebhookSchema } from '../../interface/payment.validation.js';
/**
 * Handle Final Payment Webhook Use Case
 *
 * RESPONSABILITÉ:
 * - Vérifier la signature du webhook
 * - Valider l'idempotence (éviter les doublons)
 * - Mettre à jour le Payment et l'Escrow pour le paiement final
 * - Transitioner le statut de la mission vers IN_PROGRESS
 *
 * SCÉNARIO:
 * 1. Vérifier la signature PayTech
 * 2. Trouver le payment par ref_command (doit être un paiement final)
 * 3. Vérifier l'idempotence
 * 4. Selon le statut PayTech:
 *    - SUCCESS: Payment → SUCCESS, Mission → IN_PROGRESS
 *    - FAILED: Payment → FAILED
 *    - PENDING: Garder en PENDING
 */
export class HandleFinalPaymentWebhookUseCase {
    paymentRepository;
    missionRepository;
    paytechService;
    constructor(paymentRepository, missionRepository, paytechService) {
        this.paymentRepository = paymentRepository;
        this.missionRepository = missionRepository;
        this.paytechService = paytechService;
    }
    /**
     * Exécute le traitement du webhook de paiement final
     */
    async execute(input) {
        // 1. Valider le payload avec Zod
        const validationResult = paytechWebhookSchema.safeParse(input.payload);
        if (!validationResult.success) {
            const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
            throw BusinessErrors.badRequest(`Payload webhook invalide: ${errorMessages}`);
        }
        // 2. Vérifier la signature
        const signatureVerification = this.paytechService.verifyWebhookSignature(input.rawBody, input.signature);
        if (!signatureVerification.isValid) {
            throw BusinessErrors.forbidden('Signature webhook invalide.');
        }
        // 3. Traiter le webhook
        const processed = this.paytechService.processWebhook(input.payload);
        // 4. Trouver le payment par ref_command
        // Pour le paiement final, on cherche par paytechRef car le paiement existe déjà
        const payment = await this.paymentRepository.findPaymentByPaytechRef(processed.refCommand);
        if (!payment) {
            throw BusinessErrors.notFound(`Paiement introuvable pour la référence: ${processed.refCommand}`);
        }
        // 5. Vérifier l'idempotence - ne pas traiter deux fois
        if (payment.status === PaymentStatus.SUCCESS) {
            return {
                success: true,
                paymentId: payment.id,
                missionId: payment.missionId,
                status: payment.status,
                message: 'Webhook de paiement final déjà traité (idempotence).',
            };
        }
        // 6. Vérifier que c'est bien un paiement final (montant restant)
        const escrow = await this.paymentRepository.findEscrowByPaymentId(payment.id);
        if (!escrow) {
            throw BusinessErrors.badRequest('Escrow introuvable pour ce paiement. Ce n\'est pas un paiement final valide.');
        }
        // 7. Mettre à jour selon le statut PayTech
        switch (processed.status) {
            case 'SUCCESS':
                return await this.handleSuccess(payment, escrow, processed.amount);
            case 'FAILED':
                return await this.handleFailure(payment);
            case 'PENDING':
                return {
                    success: true,
                    paymentId: payment.id,
                    missionId: payment.missionId,
                    status: PaymentStatus.PENDING,
                    message: 'Paiement final en attente de confirmation.',
                };
            default:
                throw BusinessErrors.badRequest(`Statut PayTech inconnu: ${processed.status}`);
        }
    }
    /**
     * Gère le cas de succès du paiement final
     */
    async handleSuccess(payment, escrow, amount) {
        if (!payment) {
            throw BusinessErrors.notFound('Paiement introuvable.');
        }
        // Mettre à jour le payment vers SUCCESS
        const updatedPayment = payment.markAsSuccess(`final-paytech-${Date.now()}`);
        await this.paymentRepository.updatePayment(payment.id, updatedPayment);
        // Récupérer la mission
        const mission = await this.missionRepository.findById(payment.missionId);
        if (!mission) {
            throw BusinessErrors.notFound('Mission introuvable.');
        }
        // Transitioner la mission vers IN_PROGRESS
        // (si elle était en AWAITING_FINAL_PAYMENT)
        if (mission.status === MissionStatus.AWAITING_FINAL_PAYMENT) {
            await this.missionRepository.updateStatus(payment.missionId, MissionStatus.IN_PROGRESS);
        }
        return {
            success: true,
            paymentId: payment.id,
            missionId: payment.missionId,
            status: PaymentStatus.SUCCESS,
            message: 'Paiement final confirmé. Mission en cours.',
        };
    }
    /**
     * Gère le cas d'échec du paiement final
     */
    async handleFailure(payment) {
        if (!payment) {
            throw BusinessErrors.notFound('Paiement introuvable.');
        }
        // Mettre à jour le payment vers FAILED
        const updatedPayment = payment.markAsFailed();
        await this.paymentRepository.updatePayment(payment.id, updatedPayment);
        return {
            success: true,
            paymentId: payment.id,
            missionId: payment.missionId,
            status: PaymentStatus.FAILED,
            message: 'Paiement final échoué.',
        };
    }
}
//# sourceMappingURL=HandleFinalPaymentWebhookUseCase.js.map