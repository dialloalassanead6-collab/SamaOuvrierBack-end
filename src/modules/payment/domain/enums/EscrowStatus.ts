// ============================================================================
// ESCROW STATUS ENUM - DOMAIN LAYER
// ============================================================================
// Enumération des statuts possibles d'un escrow
// ============================================================================

export enum EscrowStatus {
  /**
   * En attente de fondos
   */
  PENDING = 'PENDING',

  /**
   * Fonds bloqués en attente de validation
   */
  HELD = 'HELD',

  /**
   * Fonds libérés (paiement au worker)
   */
  RELEASED = 'RELEASED',

  /**
   * Fonds remboursés entièrement
   */
  REFUNDED = 'REFUNDED',

  /**
   * Fonds partiellement remboursés (annulation)
   */
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

// ============================================================================
// TYPE UTILITAIRE
// ============================================================================

export type EscrowStatusType = `${EscrowStatus}`;
