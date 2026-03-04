// ============================================================================
// MISSION STATUS ENUM - DOMAIN LAYER
// ============================================================================
// Enumération des statuts possibles d'une mission
// Chaque statut représente une étape dans le cycle de vie d'une mission
// ============================================================================

export enum MissionStatus {
  /**
   * En attente de paiement initial
   * La mission a été créée mais le paiement initial n'a pas encore été confirmé
   */
  PENDING_PAYMENT = 'PENDING_PAYMENT',

  /**
   * En attente d'acceptation
   * Le paiement initial a été confirmé, en attente d'acceptation par le worker
   */
  PENDING_ACCEPT = 'PENDING_ACCEPT',

  /**
   * Contact déverrouillé
   * Le worker a accepté la mission, le client peut voir les coordonnées du worker
   */
  CONTACT_UNLOCKED = 'CONTACT_UNLOCKED',

  /**
   * Négociation terminée
   * Le prix final a été fixé par le client et le worker
   */
  NEGOTIATION_DONE = 'NEGOTIATION_DONE',

  /**
   * En attente du paiement final
   * Le prix final est supérieur au prix minimum, un paiement supplémentaire est requis
   */
  AWAITING_FINAL_PAYMENT = 'AWAITING_FINAL_PAYMENT',

  /**
   * En cours
   * La mission est en cours d'exécution
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * Terminée
   * La mission a été complétée avec succès (double confirmation)
   */
  COMPLETED = 'COMPLETED',

  /**
   * Annulation en cours
   * Une annulation a été demandée par le client ou le worker
   */
  CANCEL_REQUESTED = 'CANCEL_REQUESTED',

  /**
   * Annulée
   * La mission a été annulée
   */
  CANCELLED = 'CANCELLED',

  /**
   * Refusée
   * Le worker a refusé la mission
   */
  REFUSED = 'REFUSED',
}

// ============================================================================
// TRANSITIONS DE STATUT VALIDES - MACHINE À ÉTATS
// ============================================================================
// Définition des transitions autorisées entre statuts
// ============================================================================

export const MISSION_STATUS_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  // CREATE → PENDING_PAYMENT (initial status)
  [MissionStatus.PENDING_PAYMENT]: [
    MissionStatus.PENDING_ACCEPT,    // Après confirmation du paiement initial
    MissionStatus.CANCELLED,         // Le client peut annuler avant paiement
  ],

  // PENDING_PAYMENT → PENDING_ACCEPT (confirmInitialPayment)
  [MissionStatus.PENDING_ACCEPT]: [
    MissionStatus.CONTACT_UNLOCKED, // Worker accepte
    MissionStatus.REFUSED,          // Worker refuse
  ],

  // PENDING_ACCEPT → CONTACT_UNLOCKED (acceptMission)
  [MissionStatus.CONTACT_UNLOCKED]: [
    MissionStatus.NEGOTIATION_DONE, // Après fixation du prix final
    MissionStatus.CANCELLED,        // Avant négociation, le client peut annuler
  ],

  // CONTACT_UNLOCKED → NEGOTIATION_DONE
  [MissionStatus.NEGOTIATION_DONE]: [
    MissionStatus.AWAITING_FINAL_PAYMENT, // Si prixFinal > prixMin
    MissionStatus.IN_PROGRESS,            // Si prixFinal === prixMin
    MissionStatus.CANCELLED,
  ],

  // NEGOTIATION_DONE → IN_PROGRESS ou AWAITING_FINAL_PAYMENT
  [MissionStatus.AWAITING_FINAL_PAYMENT]: [
    MissionStatus.IN_PROGRESS,    // Après confirmation du paiement final
    MissionStatus.CANCELLED,      // Le client peut annuler
  ],

  // IN_PROGRESS peut conduire à COMPLETED ou CANCEL_REQUESTED
  [MissionStatus.IN_PROGRESS]: [
    MissionStatus.COMPLETED,        // Après double confirmation
    MissionStatus.CANCEL_REQUESTED, // Demande d'annulation en cours
  ],

  // CANCEL_REQUESTED peut être approuvé ou rejeté
  [MissionStatus.CANCEL_REQUESTED]: [
    MissionStatus.CANCELLED,       // Après validation Escrow
    MissionStatus.IN_PROGRESS,     // Après rejet de la demande d'annulation
  ],

  // REFUSED - état terminal pour les missions refusées
  [MissionStatus.REFUSED]: [],

  // COMPLETED - état terminal
  [MissionStatus.COMPLETED]: [],

  // CANCELLED - état terminal
  [MissionStatus.CANCELLED]: [],
};

// ============================================================================
// TYPE UTILITAIRE
// ============================================================================

export type MissionStatusType = `${MissionStatus}`;

// ============================================================================
// TYPE POUR IDENTIFIER QUI DEMANDE L'ANNULATION
// ============================================================================

export type CancellationRequester = 'CLIENT' | 'WORKER';
