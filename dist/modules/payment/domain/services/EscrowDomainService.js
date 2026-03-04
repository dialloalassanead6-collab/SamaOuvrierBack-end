// ============================================================================
// ESCROW DOMAIN SERVICE - DOMAIN LAYER
// ============================================================================
// Service de domaine pour gérer les opérations complexes sur l'Escrow
// Contient la logique métier relative aux transferts de fonds
// ============================================================================
import { Escrow } from '../entities/Escrow.js';
import { Payment } from '../entities/Payment.js';
import { Money } from '../value-objects/Money.js';
import { EscrowStatus } from '../enums/EscrowStatus.js';
import { PaymentStatus } from '../enums/PaymentStatus.js';
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
export class EscrowDomainService {
    config;
    constructor(config) {
        this.config = config;
    }
    // ============================================================================
    // OPÉRATIONS PRINCIPALES
    // ============================================================================
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
    holdFunds(missionId, clientId, workerId, amount) {
        // Validation des paramètres
        if (!missionId || !clientId || !workerId) {
            throw new Error('missionId, clientId et workerId sont requis');
        }
        if (amount <= 0) {
            throw new Error('Le montant doit être positif');
        }
        // Création du Payment
        const idempotencyKey = this.generateIdempotencyKey(missionId, 'initial');
        const payment = this.createPayment(missionId, clientId, workerId, amount, idempotencyKey);
        // Calcul des montants (commission 10% par défaut)
        const commissionAmount = (amount * this.config.commissionPercent) / 100;
        const workerAmount = amount - commissionAmount;
        // Création de l'Escrow
        const now = new Date();
        const escrow = new Escrow({
            id: crypto.randomUUID(),
            paymentId: payment.id,
            missionId,
            amount,
            workerAmount,
            commissionAmount,
            status: EscrowStatus.PENDING,
            version: 0,
            createdAt: now,
            updatedAt: now,
        });
        // Transition vers HELD
        const heldEscrow = escrow.hold();
        return {
            payment,
            escrow: heldEscrow,
        };
    }
    /**
     * Libère les fonds vers le worker après mission complétée
     * - 90% vers le worker
     * - 10% de commission pour l'application
     *
     * @param escrow - L'escrow à libérer
     * @param releasedBy - Qui a déclenché la libération (CLIENT, WORKER, SYSTEM)
     * @returns Résultat avec les montants transférés
     */
    releaseFunds(escrow, releasedBy = 'SYSTEM') {
        if (!escrow.isHeld()) {
            throw new Error(`Impossible de libérer les fonds. Statut actuel: ${escrow.status}. ` +
                `Attendu: HELD`);
        }
        // Transition vers RELEASED avec traçabilité
        const releasedEscrow = escrow.release(releasedBy, 'Double confirmation complétée');
        return {
            workerAmount: releasedEscrow.workerAmount,
            commissionAmount: releasedEscrow.commissionAmount,
            escrow: releasedEscrow,
        };
    }
    /**
     * Effectue un remboursement complet au client
     *
     * @param escrow - L'escrow à rembourserme
     * @param releasedBy - Qui a déclenché le remboursement
     * @returns Escrow mis à jour
     */
    fullRefund(escrow, releasedBy = 'SYSTEM') {
        if (!escrow.isHeld()) {
            throw new Error(`Impossible de procéder au remboursement complet. Statut actuel: ${escrow.status}. ` +
                `Attendu: HELD`);
        }
        return escrow.fullRefund(releasedBy, 'Remboursement complet demandé');
    }
    /**
     * Effectue un remboursement partiel lors d'une annulation
     * - Si client annule: 70% client, 30% worker
     * - Si worker annule: 100% client
     *
     * @param escrow - L'escrow à traiter
     * @param requester - Qui demande l'annulation (CLIENT ou WORKER)
     * @returns Résultat avec les montants
     */
    partialRefund(escrow, requester) {
        if (!escrow.isHeld()) {
            throw new Error(`Impossible de procéder au remboursement partiel. Statut actuel: ${escrow.status}. ` +
                `Attendu: HELD`);
        }
        let clientRefundPercent;
        let workerAmount;
        let releaseReason;
        if (requester === 'CLIENT') {
            // Client annule: 70% client, 30% worker
            clientRefundPercent = 70;
            workerAmount = (escrow.amount * 30) / 100;
            releaseReason = 'Annulation par le client: 70% remboursé, 30% au worker';
        }
        else {
            // Worker annule: 100% client
            clientRefundPercent = 100;
            workerAmount = 0;
            releaseReason = 'Annulation par le worker: 100% remboursé au client';
        }
        const clientRefundAmount = (escrow.amount * clientRefundPercent) / 100;
        const refundedEscrow = escrow.partialRefund(clientRefundPercent, workerAmount, requester, releaseReason);
        return {
            escrow: refundedEscrow,
            clientAmount: clientRefundAmount,
            workerAmount,
        };
    }
    // ============================================================================
    // MÉTHODES UTILITAIRES
    // ============================================================================
    /**
     * Met à jour le Payment vers SUCCESS
     */
    markPaymentSuccess(payment, paytechRef) {
        return payment.markAsSuccess(paytechRef);
    }
    /**
     * Met à jour le Payment vers REFUNDED
     */
    markPaymentRefunded(payment) {
        return payment.markAsRefunded();
    }
    /**
     * Calcule les montants pour une mission
     */
    calculateAmounts(amount) {
        const commissionAmount = (amount * this.config.commissionPercent) / 100;
        const workerAmount = amount - commissionAmount;
        return {
            total: amount,
            workerAmount,
            commissionAmount,
            commissionPercent: this.config.commissionPercent,
        };
    }
    /**
     * Génère une clé d'idempotence
     */
    generateIdempotencyKey(missionId, type) {
        return `${missionId}-${type}-${Date.now()}-${crypto.randomUUID()}`;
    }
    /**
     * Crée un objet Payment
     */
    createPayment(missionId, clientId, workerId, amount, idempotencyKey) {
        const now = new Date();
        return new Payment({
            id: crypto.randomUUID(),
            missionId,
            clientId,
            workerId,
            amount,
            currency: this.config.currency,
            status: PaymentStatus.PENDING,
            idempotencyKey,
            createdAt: now,
            updatedAt: now,
        });
    }
}
//# sourceMappingURL=EscrowDomainService.js.map