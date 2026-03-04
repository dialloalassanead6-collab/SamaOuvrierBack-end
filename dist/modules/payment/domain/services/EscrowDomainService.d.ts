import { Escrow } from '../entities/Escrow.js';
import { Payment } from '../entities/Payment.js';
/**
 * Configuration de l'Escrow
 */
export interface EscrowConfig {
    commissionPercent: number;
    currency: string;
}
/**
 * Résultat d'une opération de libération de fonds
 */
export interface ReleaseFundsResult {
    workerAmount: number;
    commissionAmount: number;
    escrow: Escrow;
}
/**
 * Résultat d'un remboursement partiel
 */
export interface PartialRefundResult {
    clientRefundAmount: number;
    workerAmount: number;
    escrow: Escrow;
}
/**
 * Escrow Domain Service
 *
 * RESPONSABILITÉS:
 * - Gérer les opérations de blocage de fonds (hold)
 * - Gérer les opérations de libération de fonds (release)
 * - Gérer les opérations de remboursement (refund)
 * - Calculer automatiquement les commissions
 * - Appliquer les règles métier pour les différents scénarios
 */
export declare class EscrowDomainService {
    private readonly config;
    constructor(config: EscrowConfig);
    /**
     * Bloque les fonds pour une mission (initialisation de l'escrow)
     * Crée un nouveau Payment et Escrow
     *
     * @param missionId - ID de la mission
     * @param clientId - ID du client
     * @param workerId - ID du worker
     * @param amount - Montant à bloquer
     * @returns Payment et Escrow créés
     */
    holdFunds(missionId: string, clientId: string, workerId: string, amount: number): {
        payment: Payment;
        escrow: Escrow;
    };
    /**
     * Libère les fonds vers le worker après mission complétée
     * - 90% vers le worker
     * - 10% de commission pour l'application
     *
     * @param escrow - L'escrow à libérer
     * @param releasedBy - Qui a déclenché la libération (CLIENT, WORKER, SYSTEM)
     * @returns Résultat avec les montants transférés
     */
    releaseFunds(escrow: Escrow, releasedBy?: string): ReleaseFundsResult;
    /**
     * Effectue un remboursement complet au client
     *
     * @param escrow - L'escrow à rembourserme
     * @param releasedBy - Qui a déclenché le remboursement
     * @returns Escrow mis à jour
     */
    fullRefund(escrow: Escrow, releasedBy?: string): Escrow;
    /**
     * Effectue un remboursement partiel lors d'une annulation
     * - Si client annule: 70% client, 30% worker
     * - Si worker annule: 100% client
     *
     * @param escrow - L'escrow à traiter
     * @param requester - Qui demande l'annulation (CLIENT ou WORKER)
     * @returns Résultat avec les montants
     */
    partialRefund(escrow: Escrow, requester: 'CLIENT' | 'WORKER'): {
        escrow: Escrow;
        clientAmount: number;
        workerAmount: number;
    };
    /**
     * Met à jour le Payment vers SUCCESS
     */
    markPaymentSuccess(payment: Payment, paytechRef?: string): Payment;
    /**
     * Met à jour le Payment vers REFUNDED
     */
    markPaymentRefunded(payment: Payment): Payment;
    /**
     * Calcule les montants pour une mission
     */
    calculateAmounts(amount: number): {
        total: number;
        workerAmount: number;
        commissionAmount: number;
        commissionPercent: number;
    };
    /**
     * Génère une clé d'idempotence
     */
    private generateIdempotencyKey;
    /**
     * Crée un objet Payment
     */
    private createPayment;
}
//# sourceMappingURL=EscrowDomainService.d.ts.map