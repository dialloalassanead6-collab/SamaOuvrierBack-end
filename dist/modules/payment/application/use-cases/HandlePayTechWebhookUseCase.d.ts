import type { IPaymentRepository } from '../payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../mission-repository.interface.js';
import type { PayTechService, PayTechWebhookPayload } from '../../infrastructure/paytech/PayTechService.js';
/**
 * DTO pour le webhook
 */
export interface HandleWebhookInput {
    payload: PayTechWebhookPayload;
    signature: string;
    rawBody: string;
}
/**
 * DTO pour le résultat
 */
export interface HandleWebhookResult {
    success: boolean;
    paymentId: string;
    status: string;
    message: string;
}
/**
 * Handle PayTech Webhook Use Case
 *
 * RESPONSABILITÉ:
 * - Vérifier la signature du webhook
 * - Valider l'idempotence (éviter les doublestraitements)
 * - Mettre à jour le Payment et l'Escrow selon le statut PayTech
 * - Transitioner le statut de la mission
 *
 * SCÉNARIO:
 * 1. Vérifier la signature PayTech
 * 2. Trouver le payment par ref_command
 * 3. Vérifier l'idempotence (si déjà traité, ignorer)
 * 4. Selon le statut PayTech:
 *    - SUCCESS: Payment → SUCCESS, Escrow → HELD, Mission → PENDING_ACCEPT
 *    - FAILED: Payment → FAILED
 *    - PENDING: Garder en PENDING
 */
export declare class HandlePayTechWebhookUseCase {
    private readonly paymentRepository;
    private readonly missionRepository;
    private readonly paytechService;
    constructor(paymentRepository: IPaymentRepository, missionRepository: IMissionRepositoryForPayment, paytechService: PayTechService);
    /**
     * Exécute le traitement du webhook
     */
    execute(input: HandleWebhookInput): Promise<HandleWebhookResult>;
    /**
     * Gère le cas de succès du paiement
     */
    private handleSuccess;
    /**
     * Gère le cas d'échec du paiement
     */
    private handleFailure;
}
//# sourceMappingURL=HandlePayTechWebhookUseCase.d.ts.map