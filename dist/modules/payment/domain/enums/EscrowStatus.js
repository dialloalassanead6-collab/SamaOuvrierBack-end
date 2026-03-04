// ============================================================================
// ESCROW STATUS ENUM - DOMAIN LAYER
// ============================================================================
// Enumération des statuts possibles d'un escrow
// ============================================================================
export var EscrowStatus;
(function (EscrowStatus) {
    /**
     * En attente de fondos
     */
    EscrowStatus["PENDING"] = "PENDING";
    /**
     * Fonds bloqués en attente de validation
     */
    EscrowStatus["HELD"] = "HELD";
    /**
     * Fonds libérés (paiement au worker)
     */
    EscrowStatus["RELEASED"] = "RELEASED";
    /**
     * Fonds remboursés entièrement
     */
    EscrowStatus["REFUNDED"] = "REFUNDED";
    /**
     * Fonds partiellement remboursés (annulation)
     */
    EscrowStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
})(EscrowStatus || (EscrowStatus = {}));
//# sourceMappingURL=EscrowStatus.js.map