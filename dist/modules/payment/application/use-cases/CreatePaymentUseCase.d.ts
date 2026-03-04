import { EscrowDomainService } from '../../domain/index.js';
import type { IPaymentRepository } from '../payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../mission-repository.interface.js';
import type { PayTechService } from '../../infrastructure/paytech/PayTechService.js';
/**
 * DTO pour la création d'un paiement
 */
export interface CreatePaymentInput {
    missionId: string;
    clientId: string;
}
/**
 * DTO pour le résultat d'un paiement
 */
export interface CreatePaymentResult {
    paymentId: string;
    escrowId: string;
    paymentUrl: string;
    amount: number;
}
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
export declare class CreatePaymentUseCase {
    private readonly paymentRepository;
    private readonly missionRepository;
    private readonly paytechService;
    private readonly escrowDomainService;
    constructor(paymentRepository: IPaymentRepository, missionRepository: IMissionRepositoryForPayment, paytechService: PayTechService, escrowDomainService: EscrowDomainService);
    /**
     * Exécute la création du paiement
     */
    execute(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}
//# sourceMappingURL=CreatePaymentUseCase.d.ts.map