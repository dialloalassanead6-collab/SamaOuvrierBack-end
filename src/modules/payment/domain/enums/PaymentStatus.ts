// ============================================================================
// PAYMENT STATUS ENUM - DOMAIN LAYER
// ============================================================================
// Enumération des statuts possibles d'un paiement
// ============================================================================

export enum PaymentStatus {
  /**
   * Paiement en attente de traitement
   */
  PENDING = 'PENDING',

  /**
   * Paiement réussi
   */
  SUCCESS = 'SUCCESS',

  /**
   * Paiement échoué
   */
  FAILED = 'FAILED',

  /**
   * Paiement remboursé
   */
  REFUNDED = 'REFUNDED',

  /**
   * Paiement annulé
   */
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// TYPE UTILITAIRE
// ============================================================================

export type PaymentStatusType = `${PaymentStatus}`;
