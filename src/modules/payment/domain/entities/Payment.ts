// ============================================================================
// PAYMENT ENTITY - DOMAIN LAYER
// ============================================================================
// Représente le cœur métier "Payment" avec ses règles et invariants
// Entity avec identité propre et cycle de vie
// ============================================================================

import { PaymentStatus, type PaymentStatusType } from '../enums/PaymentStatus.js';

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
export class Payment {
  public readonly id: string;
  public readonly missionId: string;
  public readonly clientId: string;
  public readonly workerId: string;
  public readonly amount: number;
  public readonly currency: string;
  public readonly status: PaymentStatusType;
  public readonly paymentMethod: string | null;
  public readonly paytechRef: string | null;
  public readonly idempotencyKey: string;
  public readonly metadata: Record<string, unknown> | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: PaymentProps) {
    // Validate invariants in constructor
    this.validateAmount(props.amount);
    this.validateCurrency(props.currency);

    this.id = props.id;
    this.missionId = props.missionId;
    this.clientId = props.clientId;
    this.workerId = props.workerId;
    this.amount = props.amount;
    this.currency = props.currency.toUpperCase();
    this.status = props.status;
    this.paymentMethod = props.paymentMethod ?? null;
    this.paytechRef = props.paytechRef ?? null;
    this.idempotencyKey = props.idempotencyKey;
    this.metadata = props.metadata ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ============================================================================
  // VALIDATIONS D'INVARIANTS
  // ============================================================================

  private validateAmount(amount: number): void {
    if (amount < 0) {
      throw new Error('Le montant du paiement ne peut pas être négatif');
    }
  }

  private validateCurrency(currency: string): void {
    const validCurrencies = ['XOF', 'EUR', 'USD'];
    const upperCurrency = currency.toUpperCase();
    if (!validCurrencies.includes(upperCurrency)) {
      throw new Error(`Devise invalide: ${currency}. Devises valides: ${validCurrencies.join(', ')}`);
    }
  }

  // ============================================================================
  // MACHINE À ÉTATS - TRANSITIONS DE STATUT
  // ============================================================================

  /**
   * Transitions de statut autorisées
   */
  private static readonly STATUS_TRANSITIONS: Record<PaymentStatusType, PaymentStatusType[]> = {
    [PaymentStatus.PENDING]: [
      PaymentStatus.SUCCESS,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
    ],
    [PaymentStatus.SUCCESS]: [
      PaymentStatus.REFUNDED,
    ],
    [PaymentStatus.FAILED]: [
      PaymentStatus.PENDING, // Possibilité de réessayer
    ],
    [PaymentStatus.REFUNDED]: [], // Terminal
    [PaymentStatus.CANCELLED]: [], // Terminal
  };

  /**
   * Vérifie si une transition de statut est valide
   */
  public canTransitionTo(newStatus: PaymentStatusType): boolean {
    const allowedTransitions = Payment.STATUS_TRANSITIONS[this.status];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Effectue une transition de statut
   * @throws Error si la transition n'est pas autorisée
   */
  public transitionTo(newStatus: PaymentStatusType): Payment {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Transition invalide: impossible de passer de ${this.status} à ${newStatus}. ` +
        `Statuts possibles: ${Payment.STATUS_TRANSITIONS[this.status].join(', ')}`
      );
    }

    return new Payment({
      ...this.toProps(),
      status: newStatus,
      updatedAt: new Date(),
    });
  }

  // ============================================================================
  // MÉTHODES DE TRANSITION DE STATUT (Use Cases)
  // ============================================================================

  /**
   * Marque le paiement comme réussi
   * Transition: PENDING → SUCCESS
   */
  public markAsSuccess(paytechRef?: string): Payment {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error(
        `Impossible de marquer le paiement comme réussi. Statut actuel: ${this.status}. ` +
        `Attendu: PENDING`
      );
    }

    return new Payment({
      ...this.toProps(),
      status: PaymentStatus.SUCCESS,
      paytechRef: paytechRef ?? this.paytechRef,
      updatedAt: new Date(),
    });
  }

  /**
   * Marque le paiement comme échoué
   * Transition: PENDING → FAILED
   */
  public markAsFailed(): Payment {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error(
        `Impossible de marquer le paiement comme échoué. Statut actuel: ${this.status}. ` +
        `Attendu: PENDING`
      );
    }

    return new Payment({
      ...this.toProps(),
      status: PaymentStatus.FAILED,
      updatedAt: new Date(),
    });
  }

  /**
   * Marque le paiement comme remboursé
   * Transition: SUCCESS → REFUNDED
   */
  public markAsRefunded(): Payment {
    if (this.status !== PaymentStatus.SUCCESS) {
      throw new Error(
        `Impossible de marquer le paiement comme remboursé. Statut actuel: ${this.status}. ` +
        `Attendu: SUCCESS`
      );
    }

    return new Payment({
      ...this.toProps(),
      status: PaymentStatus.REFUNDED,
      updatedAt: new Date(),
    });
  }

  /**
   * Annule le paiement
   * Transition: PENDING → CANCELLED
   */
  public cancel(): Payment {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error(
        `Impossible d'annuler le paiement. Statut actuel: ${this.status}. ` +
        `Attendu: PENDING`
      );
    }

    return new Payment({
      ...this.toProps(),
      status: PaymentStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  // ============================================================================
  // MÉTHODES UTILITAIRES
  // ============================================================================

  /**
   * Vérifie si le paiement est en attente
   */
  public isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  /**
   * Vérifie si le paiement est réussi
   */
  public isSuccessful(): boolean {
    return this.status === PaymentStatus.SUCCESS;
  }

  /**
   * Vérifie si le paiement peut être remboursé
   */
  public canBeRefunded(): boolean {
    return this.status === PaymentStatus.SUCCESS;
  }

  /**
   * Convertit en objet simple pour sérialisation
   */
  public toProps(): PaymentProps {
    return {
      id: this.id,
      missionId: this.missionId,
      clientId: this.clientId,
      workerId: this.workerId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      paymentMethod: this.paymentMethod,
      paytechRef: this.paytechRef,
      idempotencyKey: this.idempotencyKey,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// ============================================================================
// TYPE UTILITAIRE
// ============================================================================

export type PaymentWithDetails = Payment;
