// ============================================================================
// PAYMENT STATUS ENUM - DOMAIN LAYER
// ============================================================================
// Enumération des statuts possibles d'un paiement
// ============================================================================
export var PaymentStatus;
(function (PaymentStatus) {
    /**
     * Paiement en attente de traitement
     */
    PaymentStatus["PENDING"] = "PENDING";
    /**
     * Paiement réussi
     */
    PaymentStatus["SUCCESS"] = "SUCCESS";
    /**
     * Paiement échoué
     */
    PaymentStatus["FAILED"] = "FAILED";
    /**
     * Paiement remboursé
     */
    PaymentStatus["REFUNDED"] = "REFUNDED";
    /**
     * Paiement annulé
     */
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (PaymentStatus = {}));
//# sourceMappingURL=PaymentStatus.js.map