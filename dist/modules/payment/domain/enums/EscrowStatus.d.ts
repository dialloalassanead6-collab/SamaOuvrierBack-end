export declare enum EscrowStatus {
    /**
     * En attente de fondos
     */
    PENDING = "PENDING",
    /**
     * Fonds bloqués en attente de validation
     */
    HELD = "HELD",
    /**
     * Fonds libérés (paiement au worker)
     */
    RELEASED = "RELEASED",
    /**
     * Fonds remboursés entièrement
     */
    REFUNDED = "REFUNDED",
    /**
     * Fonds partiellement remboursés (annulation)
     */
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}
export type EscrowStatusType = `${EscrowStatus}`;
//# sourceMappingURL=EscrowStatus.d.ts.map