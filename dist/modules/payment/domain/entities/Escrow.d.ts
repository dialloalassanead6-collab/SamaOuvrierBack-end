import { type EscrowStatusType } from '../enums/EscrowStatus.js';
/**
 * Propriétés du Escrow
 */
export interface EscrowProps {
    id: string;
    paymentId: string;
    missionId: string;
    amount: number;
    workerAmount: number;
    commissionAmount: number;
    status: EscrowStatusType;
    releaseType?: string | null;
    paytechRef?: string | null;
    releasedBy?: string | null;
    releaseReason?: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    releasedAt?: Date | null;
}
/**
 * Escrow Entity
 *
 * RESPONSABILITÉS:
 * - Représenter un escrow dans le système
 * - Gérer les fonds bloqués (hold)
 * - Gérer la libération des fonds (release)
 * - Gérer les remboursements (refund)
 * - Calculer automatiquement les commissions
 * - Être indépendant de tout framework (framework-agnostic)
 *
 * INVARIANTS:
 * - paymentId, missionId sont obligatoires
 * - amount >= 0
 * - workerAmount + commissionAmount == amount (sauf pour partial refunds)
 */
export declare class Escrow {
    readonly id: string;
    readonly paymentId: string;
    readonly missionId: string;
    readonly amount: number;
    readonly workerAmount: number;
    readonly commissionAmount: number;
    readonly status: EscrowStatusType;
    readonly releaseType: string | null;
    readonly paytechRef: string | null;
    readonly releasedBy: string | null;
    readonly releaseReason: string | null;
    readonly version: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly releasedAt: Date | null;
    constructor(props: EscrowProps);
    private validateAmounts;
    /**
     * Crée un nouvel escrow avec calcul automatique de la commission
     * @param amount - Montant total bloqué
     * @param commissionPercent - Pourcentage de commission (ex: 10 pour 10%)
     */
    static create(paymentId: string, missionId: string, amount: number, commissionPercent: number): Escrow;
    /**
     * Transitions de statut autorisées
     */
    private static readonly STATUS_TRANSITIONS;
    /**
     * Vérifie si une transition de statut est valide
     */
    canTransitionTo(newStatus: EscrowStatusType): boolean;
    /**
     * Effectue une transition de statut
     * @throws Error si la transition n'est pas autorisée
     */
    transitionTo(newStatus: EscrowStatusType): Escrow;
    /**
     * Bloque les fonds (hold funds)
     * Transition: PENDING → HELD
     * @throws Error si le statut actuel n'est pas PENDING
     */
    hold(paytechRef?: string): Escrow;
    /**
     * Libère les fonds (release funds) - Paiement complet au worker
     * Transition: HELD → RELEASED
     * @throws Error si le statut actuel n'est pas HELD
     */
    release(releasedBy: string, releaseReason?: string, paytechRef?: string): Escrow;
    /**
     * Effectue un remboursement complet (full refund)
     * Transition: HELD → REFUNDED
     * @throws Error si le statut actuel n'est pas HELD
     */
    fullRefund(releasedBy?: string, releaseReason?: string, paytechRef?: string): Escrow;
    /**
     * Effectue un remboursement partiel (partial refund)
     * Transition: HELD → PARTIALLY_REFUNDED
     * @param clientRefundPercent - Pourcentage remboursé au client (ex: 70 pour 70%)
     * @param workerAmount - Montant effectivement payé au worker
     * @throws Error si le statut actuel n'est pas HELD
     */
    partialRefund(clientRefundPercent: number, workerAmount: number, releasedBy?: string, releaseReason?: string, paytechRef?: string): Escrow;
    /**
     * Vérifie si les fonds sont bloqués
     */
    isHeld(): boolean;
    /**
     * Vérifie si les fonds sont libérés
     */
    isReleased(): boolean;
    /**
     * Vérifie si les fonds sont remboursés
     */
    isRefunded(): boolean;
    /**
     * Vérifie si les fonds sont partiellement remboursés
     */
    isPartiallyRefunded(): boolean;
    /**
     * Convertit en objet simple pour sérialisation
     */
    toProps(): EscrowProps;
    /**
     * Retourne le pourcentage de commission
     */
    getCommissionPercent(): number;
}
export type EscrowWithDetails = Escrow;
//# sourceMappingURL=Escrow.d.ts.map