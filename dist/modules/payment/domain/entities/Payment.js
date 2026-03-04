// ============================================================================
// PAYMENT ENTITY - DOMAIN LAYER
// ============================================================================
// Représente le cœur métier "Payment" avec ses règles et invariants
// Entity avec identité propre et cycle de vie
// ============================================================================
import { PaymentStatus } from '../enums/PaymentStatus.js';
/**
 * Payment Entity
 *
 * RESPONSABILITÉS:
 * - Représenter un paiement dans le système
 * - Encapsuler les règles métier liées aux paiements
 * - Gérer le cycle de vie du paiement (PENDING → SUCCESS/FAILED/REFUNDED)
 * - Être indépendant de tout framework (framework-agnostic)
 *
 * INVARIANTS:
 * - missionId, clientId, workerId sont obligatoires
 * - amount doit être >= 0
 * - currency doit être une devise valide (XOF par défaut)
 * - idempotencyKey doit être unique
 */
export class Payment {
    id;
    missionId;
    clientId;
    workerId;
    amount;
    currency;
    status;
    paymentMethod;
    paytechRef;
    idempotencyKey;
    metadata;
    createdAt;
    updatedAt;
    constructor(props) {
        // Validate invariants in constructor
        this.validateAmount(props.amount);
        this.validateCurrency(props.currency);
        this.id = props.id;
        this.missionId = props.missionId;
        this.clientId = props.clientId;
        this.workerId = props.workerId;
        this.amount = props.amount;
        this.currency = props.currency.toUpperCase();
        this.status = props.status;
        this.paymentMethod = props.paymentMethod ?? null;
        this.paytechRef = props.paytechRef ?? null;
        this.idempotencyKey = props.idempotencyKey;
        this.metadata = props.metadata ?? null;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    // ============================================================================
    // VALIDATIONS D'INVARIANTS
    // ============================================================================
    validateAmount(amount) {
        if (amount < 0) {
            throw new Error('Le montant du paiement ne peut pas être négatif');
        }
    }
    validateCurrency(currency) {
        const validCurrencies = ['XOF', 'EUR', 'USD'];
        const upperCurrency = currency.toUpperCase();
        if (!validCurrencies.includes(upperCurrency)) {
            throw new Error(`Devise invalide: ${currency}. Devises valides: ${validCurrencies.join(', ')}`);
        }
    }
    // ============================================================================
    // MACHINE À ÉTATS - TRANSITIONS DE STATUT
    // ============================================================================
    /**
     * Transitions de statut autorisées
     */
    static STATUS_TRANSITIONS = {
        [PaymentStatus.PENDING]: [
            PaymentStatus.SUCCESS,
            PaymentStatus.FAILED,
            PaymentStatus.CANCELLED,
        ],
        [PaymentStatus.SUCCESS]: [
            PaymentStatus.REFUNDED,
        ],
        [PaymentStatus.FAILED]: [
            PaymentStatus.PENDING, // Possibilité de réessayer
        ],
        [PaymentStatus.REFUNDED]: [], // Terminal
        [PaymentStatus.CANCELLED]: [], // Terminal
    };
    /**
     * Vérifie si une transition de statut est valide
     */
    canTransitionTo(newStatus) {
        const allowedTransitions = Payment.STATUS_TRANSITIONS[this.status];
        return allowedTransitions.includes(newStatus);
    }
    /**
     * Effectue une transition de statut
     * @throws Error si la transition n'est pas autorisée
     */
    transitionTo(newStatus) {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(`Transition invalide: impossible de passer de ${this.status} à ${newStatus}. ` +
                `Statuts possibles: ${Payment.STATUS_TRANSITIONS[this.status].join(', ')}`);
        }
        return new Payment({
            ...this.toProps(),
            status: newStatus,
            updatedAt: new Date(),
        });
    }
    // ============================================================================
    // MÉTHODES DE TRANSITION DE STATUT (Use Cases)
    // ============================================================================
    /**
     * Marque le paiement comme réussi
     * Transition: PENDING → SUCCESS
     */
    markAsSuccess(paytechRef) {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error(`Impossible de marquer le paiement comme réussi. Statut actuel: ${this.status}. ` +
                `Attendu: PENDING`);
        }
        return new Payment({
            ...this.toProps(),
            status: PaymentStatus.SUCCESS,
            paytechRef: paytechRef ?? this.paytechRef,
            updatedAt: new Date(),
        });
    }
    /**
     * Marque le paiement comme échoué
     * Transition: PENDING → FAILED
     */
    markAsFailed() {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error(`Impossible de marquer le paiement comme échoué. Statut actuel: ${this.status}. ` +
                `Attendu: PENDING`);
        }
        return new Payment({
            ...this.toProps(),
            status: PaymentStatus.FAILED,
            updatedAt: new Date(),
        });
    }
    /**
     * Marque le paiement comme remboursé
     * Transition: SUCCESS → REFUNDED
     */
    markAsRefunded() {
        if (this.status !== PaymentStatus.SUCCESS) {
            throw new Error(`Impossible de marquer le paiement comme remboursé. Statut actuel: ${this.status}. ` +
                `Attendu: SUCCESS`);
        }
        return new Payment({
            ...this.toProps(),
            status: PaymentStatus.REFUNDED,
            updatedAt: new Date(),
        });
    }
    /**
     * Annule le paiement
     * Transition: PENDING → CANCELLED
     */
    cancel() {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error(`Impossible d'annuler le paiement. Statut actuel: ${this.status}. ` +
                `Attendu: PENDING`);
        }
        return new Payment({
            ...this.toProps(),
            status: PaymentStatus.CANCELLED,
            updatedAt: new Date(),
        });
    }
    // ============================================================================
    // MÉTHODES UTILITAIRES
    // ============================================================================
    /**
     * Vérifie si le paiement est en attente
     */
    isPending() {
        return this.status === PaymentStatus.PENDING;
    }
    /**
     * Vérifie si le paiement est réussi
     */
    isSuccessful() {
        return this.status === PaymentStatus.SUCCESS;
    }
    /**
     * Vérifie si le paiement peut être remboursé
     */
    canBeRefunded() {
        return this.status === PaymentStatus.SUCCESS;
    }
    /**
     * Convertit en objet simple pour sérialisation
     */
    toProps() {
        return {
            id: this.id,
            missionId: this.missionId,
            clientId: this.clientId,
            workerId: this.workerId,
            amount: this.amount,
            currency: this.currency,
            status: this.status,
            paymentMethod: this.paymentMethod,
            paytechRef: this.paytechRef,
            idempotencyKey: this.idempotencyKey,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
//# sourceMappingURL=Payment.js.map