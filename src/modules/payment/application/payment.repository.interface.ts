// ============================================================================
// PAYMENT REPOSITORY INTERFACE - APPLICATION LAYER
// ============================================================================
// Définit le contrat pour l'accès aux données des paiements
// Suit le principe ISP (Interface Segregation Principle)
// ============================================================================

import type { Payment } from '../domain/index.js';
import type { Escrow } from '../domain/index.js';

/**
 * Input pour créer un Payment
 */
export interface CreatePaymentInput {
  missionId: string;
  clientId: string;
  workerId: string;
  amount: number;
  currency?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input pour créer un Escrow
 */
export interface CreateEscrowInput {
  paymentId: string;
  missionId: string;
  amount: number;
  workerAmount: number;
  commissionAmount: number;
  status: string;
}

/**
 * Payment Repository Interface
 * 
 * Contrat spécialisé pour les opérations sur les paiements et escrows
 * Implémentée par PrismaPaymentRepository
 */
export interface IPaymentRepository {
  // ==================== PAYMENT OPERATIONS ====================

  /**
   * Trouve un payment par son ID
   */
  findPaymentById(id: string): Promise<Payment | null>;

  /**
   * Trouve un payment par sa clé d'idempotence
   */
  findPaymentByIdempotencyKey(key: string): Promise<Payment | null>;

  /**
   * Trouve un payment par ID de mission
   */
  findPaymentByMissionId(missionId: string): Promise<Payment | null>;

  /**
   * Trouve un payment par référence PayTech
   */
  findPaymentByPaytechRef(ref: string): Promise<Payment | null>;

  /**
   * Crée un nouveau payment
   */
  createPayment(input: CreatePaymentInput): Promise<Payment>;

  /**
   * Met à jour un payment existant
   */
  updatePayment(id: string, payment: Payment): Promise<Payment>;

  // ==================== ESCROW OPERATIONS ====================

  /**
   * Trouve un escrow par son ID
   */
  findEscrowById(id: string): Promise<Escrow | null>;

  /**
   * Trouve un escrow par ID de mission
   */
  findEscrowByMissionId(missionId: string): Promise<Escrow | null>;

  /**
   * Trouve un escrow par ID de payment
   */
  findEscrowByPaymentId(paymentId: string): Promise<Escrow | null>;

  /**
   * Crée un nouveau escrow
   */
  createEscrow(input: CreateEscrowInput): Promise<Escrow>;

  /**
   * Met à jour un escrow existant
   * @param expectedVersion - Version attendue pour optimistic locking (optionnel)
   */
  updateEscrow(id: string, escrow: Escrow, expectedVersion?: number): Promise<Escrow>;

  // ==================== TRANSACTION OPERATIONS ====================

  /**
   * Sauvegarde un payment et un escrow dans une transaction
   */
  savePaymentWithEscrow(payment: Payment, escrow: Escrow): Promise<{ payment: Payment; escrow: Escrow }>;

  /**
   * Met à jour le payment et l'escrow après libération des fonds
   * @param expectedVersion - Version attendue pour optimistic locking (optionnel)
   */
  updateAfterRelease(
    paymentId: string,
    escrowId: string,
    payment: Payment,
    escrow: Escrow,
    expectedVersion?: number
  ): Promise<void>;

  /**
   * Met à jour le payment et l'escrow après remboursement
   * @param expectedVersion - Version attendue pour optimistic locking (optionnel)
   */
  updateAfterRefund(
    paymentId: string,
    escrowId: string,
    payment: Payment,
    escrow: Escrow,
    expectedVersion?: number
  ): Promise<void>;
}
