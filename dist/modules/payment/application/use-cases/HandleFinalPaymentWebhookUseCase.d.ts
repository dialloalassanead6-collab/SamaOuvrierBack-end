import type { IPaymentRepository } from '../payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../mission-repository.interface.js';
import type { PayTechService, PayTechWebhookPayload } from '../../infrastructure/paytech/PayTechService.js';
/**
 * DTO pour le webhook de paiement final
 */
export interface HandleFinalPaymentWebhookInput {
    payload: PayTechWebhookPayload;
    signature: string;
    rawBody: string;
}
/**
 * DTO pour le résultat
 */
export interface HandleFinalPaymentWebhookResult {
    success: boolean;
    paymentId: string;
    missionId: string;
    status: string;
    message: string;
}
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
export declare class HandleFinalPaymentWebhookUseCase {
    private readonly paymentRepository;
    private readonly missionRepository;
    private readonly paytechService;
    constructor(paymentRepository: IPaymentRepository, missionRepository: IMissionRepositoryForPayment, paytechService: PayTechService);
    /**
     * Exécute le traitement du webhook de paiement final
     */
    execute(input: HandleFinalPaymentWebhookInput): Promise<HandleFinalPaymentWebhookResult>;
    /**
     * Gère le cas de succès du paiement final
     */
    private handleSuccess;
    /**
     * Gère le cas d'échec du paiement final
     */
    private handleFailure;
}
//# sourceMappingURL=HandleFinalPaymentWebhookUseCase.d.ts.map