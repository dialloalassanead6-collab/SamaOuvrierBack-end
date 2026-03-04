// ============================================================================
// ESCROW ENTITY - DOMAIN LAYER
// ============================================================================
// Représente le cœur métier "Escrow" avec ses règles et invariants
// Entity qui gère les fonds bloqués pour une mission
// ============================================================================

import { EscrowStatus, type EscrowStatusType } from '../enums/EscrowStatus.js';

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
  // Traçabilité
  releasedBy?: string | null;
  releaseReason?: string | null;
  // Optimistic locking
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
export class Escrow {
  public readonly id: string;
  public readonly paymentId: string;
  public readonly missionId: string;
  public readonly amount: number;
  public readonly workerAmount: number;
  public readonly commissionAmount: number;
  public readonly status: EscrowStatusType;
  public readonly releaseType: string | null;
  public readonly paytechRef: string | null;
  // Traçabilité
  public readonly releasedBy: string | null;
  public readonly releaseReason: string | null;
  // Optimistic locking
  public readonly version: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly releasedAt: Date | null;

  constructor(props: EscrowProps) {
    // Validate invariants in constructor
    this.validateAmounts(props.amount, props.workerAmount, props.commissionAmount);

    this.id = props.id;
    this.paymentId = props.paymentId;
    this.missionId = props.missionId;
    this.amount = props.amount;
    this.workerAmount = props.workerAmount;
    this.commissionAmount = props.commissionAmount;
    this.status = props.status;
    this.releaseType = props.releaseType ?? null;
    this.paytechRef = props.paytechRef ?? null;
    // Traçabilité
    this.releasedBy = props.releasedBy ?? null;
    this.releaseReason = props.releaseReason ?? null;
    // Optimistic locking
    this.version = props.version ?? 0;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.releasedAt = props.releasedAt ?? null;
  }

  // ============================================================================
  // VALIDATIONS D'INVARIANTS
  // ============================================================================

  private validateAmounts(amount: number, workerAmount: number, commissionAmount: number): void {
    if (amount < 0) {
      throw new Error('Le montant de l\'escrow ne peut pas être négatif');
    }
    if (workerAmount < 0) {
      throw new Error('Le montant pour le worker ne peut pas être négatif');
    }
    if (commissionAmount < 0) {
      throw new Error('Le montant de la commission ne peut pas être négatif');
    }
    if (workerAmount + commissionAmount > amount) {
      throw new Error('La somme workerAmount + commissionAmount ne peut pas dépasser amount');
    }
  }

  // ============================================================================
  // FACTORY METHODS
  // ============================================================================

  /**
   * Crée un nouvel escrow avec calcul automatique de la commission
   * @param amount - Montant total bloqué
   * @param commissionPercent - Pourcentage de commission (ex: 10 pour 10%)
   */
  static create(
    paymentId: string,
    missionId: string,
    amount: number,
    commissionPercent: number
  ): Escrow {
    const commissionAmount = (amount * commissionPercent) / 100;
    const workerAmount = amount - commissionAmount;
    const now = new Date();

    return new Escrow({
      id: crypto.randomUUID(),
      paymentId,
      missionId,
      amount,
      workerAmount,
      commissionAmount,
      status: 'PENDING' as EscrowStatusType,
      version: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ============================================================================
  // MACHINE À ÉTATS - TRANSITIONS DE STATUT
  // ============================================================================

  /**
   * Transitions de statut autorisées
   */
  private static readonly STATUS_TRANSITIONS: Record<EscrowStatusType, EscrowStatusType[]> = {
    [EscrowStatus.PENDING]: [
      EscrowStatus.HELD,
    ],
    [EscrowStatus.HELD]: [
      EscrowStatus.RELEASED,
      EscrowStatus.REFUNDED,
      EscrowStatus.PARTIALLY_REFUNDED,
    ],
    [EscrowStatus.RELEASED]: [], // Terminal
    [EscrowStatus.REFUNDED]: [], // Terminal
    [EscrowStatus.PARTIALLY_REFUNDED]: [], // Terminal
  };

  /**
   * Vérifie si une transition de statut est valide
   */
  public canTransitionTo(newStatus: EscrowStatusType): boolean {
    const allowedTransitions = Escrow.STATUS_TRANSITIONS[this.status];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Effectue une transition de statut
   * @throws Error si la transition n'est pas autorisée
   */
  public transitionTo(newStatus: EscrowStatusType): Escrow {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Transition invalide: impossible de passer de ${this.status} à ${newStatus}. ` +
        `Statuts possibles: ${Escrow.STATUS_TRANSITIONS[this.status].join(', ')}`
      );
    }

    return new Escrow({
      ...this.toProps(),
      status: newStatus,
      updatedAt: new Date(),
    });
  }

  // ============================================================================
  // MÉTHODES DE TRANSITION DE STATUT (Use Cases)
  // ============================================================================

  /**
   * Bloque les fonds (hold funds)
   * Transition: PENDING → HELD
   * @throws Error si le statut actuel n'est pas PENDING
   */
  public hold(paytechRef?: string): Escrow {
    if (this.status !== EscrowStatus.PENDING) {
      throw new Error(
        `Impossible de bloquer les fonds. Statut actuel: ${this.status}. ` +
        `Attendu: PENDING`
      );
    }

    return new Escrow({
      ...this.toProps(),
      status: EscrowStatus.HELD,
      paytechRef: paytechRef ?? this.paytechRef,
      updatedAt: new Date(),
    });
  }

  /**
   * Libère les fonds (release funds) - Paiement complet au worker
   * Transition: HELD → RELEASED
   * @throws Error si le statut actuel n'est pas HELD
   */
  public release(releasedBy: string, releaseReason?: string, paytechRef?: string): Escrow {
    if (this.status !== EscrowStatus.HELD) {
      throw new Error(
        `Impossible de libérer les fonds. Statut actuel: ${this.status}. ` +
        `Attendu: HELD`
      );
    }

    return new Escrow({
      ...this.toProps(),
      status: EscrowStatus.RELEASED,
      releaseType: 'FULL',
      releasedBy: releasedBy,
      releaseReason: releaseReason ?? 'Double confirmation complétée',
      paytechRef: paytechRef ?? this.paytechRef,
      version: this.version + 1,
      updatedAt: new Date(),
      releasedAt: new Date(),
    });
  }

  /**
   * Effectue un remboursement complet (full refund)
   * Transition: HELD → REFUNDED
   * @throws Error si le statut actuel n'est pas HELD
   */
  public fullRefund(releasedBy: string = 'SYSTEM', releaseReason?: string, paytechRef?: string): Escrow {
    if (this.status !== EscrowStatus.HELD) {
      throw new Error(
        `Impossible de procéder au remboursement complet. Statut actuel: ${this.status}. ` +
        `Attendu: HELD`
      );
    }

    return new Escrow({
      ...this.toProps(),
      status: EscrowStatus.REFUNDED,
      releaseType: 'FULL_REFUND',
      releasedBy: releasedBy,
      releaseReason: releaseReason ?? 'Remboursement complet',
      paytechRef: paytechRef ?? this.paytechRef,
      version: this.version + 1,
      updatedAt: new Date(),
      releasedAt: new Date(),
    });
  }

  /**
   * Effectue un remboursement partiel (partial refund)
   * Transition: HELD → PARTIALLY_REFUNDED
   * @param clientRefundPercent - Pourcentage remboursé au client (ex: 70 pour 70%)
   * @param workerAmount - Montant effectivement payé au worker
   * @throws Error si le statut actuel n'est pas HELD
   */
  public partialRefund(
    clientRefundPercent: number,
    workerAmount: number,
    releasedBy: string = 'SYSTEM',
    releaseReason?: string,
    paytechRef?: string
  ): Escrow {
    if (this.status !== EscrowStatus.HELD) {
      throw new Error(
        `Impossible de procéder au remboursement partiel. Statut actuel: ${this.status}. ` +
        `Attendu: HELD`
      );
    }

    if (clientRefundPercent < 0 || clientRefundPercent > 100) {
      throw new Error('Le pourcentage de remboursement doit être entre 0 et 100');
    }

    // Le worker reçoit le montant restant (ex: 30% si client reçoit 70%)
    const newWorkerAmount = workerAmount;
    const newCommissionAmount = this.commissionAmount * ((100 - clientRefundPercent) / 100);

    return new Escrow({
      ...this.toProps(),
      status: EscrowStatus.PARTIALLY_REFUNDED,
      releaseType: 'PARTIAL',
      releasedBy: releasedBy,
      releaseReason: releaseReason ?? `Remboursement partiel: ${clientRefundPercent}% au client`,
      workerAmount: newWorkerAmount,
      commissionAmount: newCommissionAmount,
      paytechRef: paytechRef ?? this.paytechRef,
      version: this.version + 1,
      updatedAt: new Date(),
      releasedAt: new Date(),
    });
  }

  // ============================================================================
  // MÉTHODES UTILITAIRES
  // ============================================================================

  /**
   * Vérifie si les fonds sont bloqués
   */
  public isHeld(): boolean {
    return this.status === EscrowStatus.HELD;
  }

  /**
   * Vérifie si les fonds sont libérés
   */
  public isReleased(): boolean {
    return this.status === EscrowStatus.RELEASED;
  }

  /**
   * Vérifie si les fonds sont remboursés
   */
  public isRefunded(): boolean {
    return this.status === EscrowStatus.REFUNDED;
  }

  /**
   * Vérifie si les fonds sont partiellement remboursés
   */
  public isPartiallyRefunded(): boolean {
    return this.status === EscrowStatus.PARTIALLY_REFUNDED;
  }

  /**
   * Convertit en objet simple pour sérialisation
   */
  public toProps(): EscrowProps {
    return {
      id: this.id,
      paymentId: this.paymentId,
      missionId: this.missionId,
      amount: this.amount,
      workerAmount: this.workerAmount,
      commissionAmount: this.commissionAmount,
      status: this.status,
      releaseType: this.releaseType,
      paytechRef: this.paytechRef,
      // Traçabilité
      releasedBy: this.releasedBy,
      releaseReason: this.releaseReason,
      // Optimistic locking
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      releasedAt: this.releasedAt,
    };
  }

  /**
   * Retourne le pourcentage de commission
   */
  public getCommissionPercent(): number {
    if (this.amount === 0) return 0;
    return (this.commissionAmount / this.amount) * 100;
  }
}

// ============================================================================
// TYPE UTILITAIRE
// ============================================================================

export type EscrowWithDetails = Escrow;
