export declare enum PaymentStatus {
    /**
     * Paiement en attente de traitement
     */
    PENDING = "PENDING",
    /**
     * Paiement réussi
     */
    SUCCESS = "SUCCESS",
    /**
     * Paiement échoué
     */
    FAILED = "FAILED",
    /**
     * Paiement remboursé
     */
    REFUNDED = "REFUNDED",
    /**
     * Paiement annulé
     */
    CANCELLED = "CANCELLED"
}
export type PaymentStatusType = `${PaymentStatus}`;
//# sourceMappingURL=PaymentStatus.d.ts.map