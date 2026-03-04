import { type PaymentStatusType } from '../enums/PaymentStatus.js';
/**
 * Propriétés du Payment
 */
export interface PaymentProps {
    id: string;
    missionId: string;
    clientId: string;
    workerId: string;
    amount: number;
    currency: string;
    status: PaymentStatusType;
    paymentMethod?: string | null;
    paytechRef?: string | null;
    idempotencyKey: string;
    metadata?: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
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
export declare class Payment {
    readonly id: string;
    readonly missionId: string;
    readonly clientId: string;
    readonly workerId: string;
    readonly amount: number;
    readonly currency: string;
    readonly status: PaymentStatusType;
    readonly paymentMethod: string | null;
    readonly paytechRef: string | null;
    readonly idempotencyKey: string;
    readonly metadata: Record<string, unknown> | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: PaymentProps);
    private validateAmount;
    private validateCurrency;
    /**
     * Transitions de statut autorisées
     */
    private static readonly STATUS_TRANSITIONS;
    /**
     * Vérifie si une transition de statut est valide
     */
    canTransitionTo(newStatus: PaymentStatusType): boolean;
    /**
     * Effectue une transition de statut
     * @throws Error si la transition n'est pas autorisée
     */
    transitionTo(newStatus: PaymentStatusType): Payment;
    /**
     * Marque le paiement comme réussi
     * Transition: PENDING → SUCCESS
     */
    markAsSuccess(paytechRef?: string): Payment;
    /**
     * Marque le paiement comme échoué
     * Transition: PENDING → FAILED
     */
    markAsFailed(): Payment;
    /**
     * Marque le paiement comme remboursé
     * Transition: SUCCESS → REFUNDED
     */
    markAsRefunded(): Payment;
    /**
     * Annule le paiement
     * Transition: PENDING → CANCELLED
     */
    cancel(): Payment;
    /**
     * Vérifie si le paiement est en attente
     */
    isPending(): boolean;
    /**
     * Vérifie si le paiement est réussi
     */
    isSuccessful(): boolean;
    /**
     * Vérifie si le paiement peut être remboursé
     */
    canBeRefunded(): boolean;
    /**
     * Convertit en objet simple pour sérialisation
     */
    toProps(): PaymentProps;
}
export type PaymentWithDetails = Payment;
//# sourceMappingURL=Payment.d.ts.map