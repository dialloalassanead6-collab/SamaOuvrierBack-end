import { EscrowDomainService } from '../../domain/services/EscrowDomainService.js';
import type { IPaymentRepository } from '../payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../mission-repository.interface.js';
import type { PayTechService } from '../../infrastructure/paytech/PayTechService.js';
import { NotificationService } from '../../../notification/index.js';
/**
 * DTO pour libérer l'escrow
 */
export interface ReleaseEscrowInput {
    missionId: string;
    userId: string;
    role: 'CLIENT' | 'WORKER';
}
/**
 * DTO pour le résultat
 */
export interface ReleaseEscrowResult {
    success: boolean;
    missionStatus: string;
    workerAmount: number;
    commissionAmount: number;
    message: string;
}
/**
 * Release Escrow Use Case
 *
 * RESPONSABILITÉ:
 * - Libérer les fonds de l'escrow après double confirmation
 * - Payer le worker (90%) et la commission (10%)
 * - Mettre à jour le statut de la mission vers COMPLETED
 * - Notifier le worker du paiement libéré
 *
 * SCÉNARIO:
 * 1. Vérifier que l'escrow existe et est en attente (HELD)
 * 2. Vérifier que la mission est en cours (IN_PROGRESS)
 * 3. Marquer la confirmation du user (client ou worker)
 * 4. Si les deux ont confirmé:
 *    a. Libérer les fonds vers le worker
 *    b. Mettre à jour le paiement vers SUCCESS
 *    c. Mettre à jour l'escrow vers RELEASED
 *    d. Mettre à jour la mission vers COMPLETED
 *    e.Notifier le worker
 */
export declare class ReleaseEscrowUseCase {
    private readonly paymentRepository;
    private readonly missionRepository;
    private readonly paytechService;
    private readonly escrowDomainService;
    private readonly notificationService;
    constructor(paymentRepository: IPaymentRepository, missionRepository: IMissionRepositoryForPayment, paytechService: PayTechService, escrowDomainService: EscrowDomainService, notificationService: NotificationService);
    /**
     * Exécute la libération de l'escrow
     */
    execute(input: ReleaseEscrowInput): Promise<ReleaseEscrowResult>;
}
//# sourceMappingURL=ReleaseEscrowUseCase.d.ts.map