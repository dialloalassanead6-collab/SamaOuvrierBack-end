import { EscrowDomainService } from '../../domain/services/EscrowDomainService.js';
import type { IPaymentRepository } from '../payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../mission-repository.interface.js';
import type { PayTechService } from '../../infrastructure/paytech/PayTechService.js';
/**
 * DTO pour annuler le paiement
 */
export interface CancelMissionPaymentInput {
    missionId: string;
    userId: string;
    role: 'CLIENT' | 'WORKER';
    cancellationType: 'DIRECT' | 'REQUESTED';
}
/**
 * DTO pour le résultat
 */
export interface CancelMissionPaymentResult {
    success: boolean;
    escrowStatus: string;
    clientRefundAmount: number;
    workerAmount: number;
    commissionAmount: number;
    message: string;
}
/**
 * Cancel Mission Payment Use Case
 *
 * RESPONSABILITÉ:
 * - Gérer l'annulation du paiement d'une mission
 * - Calculer les montants de remboursement selon le demandeur
 * - Mettre à jour les statuts Payment, Escrow et Mission
 *
 * SCÉNARIOS:
 * 1. Client annule en IN_PROGRESS: 70% client, 30% worker
 * 2. Worker annule en IN_PROGRESS: 100% client
 * 3. Worker refuse en PENDING_ACCEPT: 100% client (refund complet)
 */
export declare class CancelMissionPaymentUseCase {
    private readonly paymentRepository;
    private readonly missionRepository;
    private readonly paytechService;
    private readonly escrowDomainService;
    constructor(paymentRepository: IPaymentRepository, missionRepository: IMissionRepositoryForPayment, paytechService: PayTechService, escrowDomainService: EscrowDomainService);
    /**
     * Exécute l'annulation du paiement
     */
    execute(input: CancelMissionPaymentInput): Promise<CancelMissionPaymentResult>;
    /**
     * Gère le cas où le worker refuse la mission (PENDING_ACCEPT)
     */
    private handleWorkerRefuse;
    /**
     * Gère l'annulation en cours (IN_PROGRESS)
     */
    private handleInProgressCancellation;
    /**
     * Gère l'annulation avant IN_PROGRESS (remboursement complet)
     */
    private handlePreInProgressCancellation;
}
//# sourceMappingURL=CancelMissionPaymentUseCase.d.ts.map