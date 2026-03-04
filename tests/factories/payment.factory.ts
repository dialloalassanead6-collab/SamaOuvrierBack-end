// ============================================================================
// PAYMENT FACTORY - TEST DATA FACTORY
// ============================================================================
// Factory for creating test payment and escrow data
// ============================================================================

import type { PaymentStatus, EscrowStatus } from '@prisma/client';
import crypto from 'crypto';

export interface PaymentFactoryOptions {
  id?: string;
  missionId?: string;
  clientId?: string;
  workerId?: string;
  amount?: number;
  currency?: string;
  status?: PaymentStatus;
  paymentMethod?: string | null;
  paytechRef?: string | null;
  idempotencyKey?: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EscrowFactoryOptions {
  id?: string;
  paymentId?: string;
  missionId?: string;
  amount?: number;
  workerAmount?: number;
  commissionAmount?: number;
  status?: EscrowStatus;
  releaseType?: 'FULL' | 'PARTIAL' | null;
  paytechRef?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  releasedAt?: Date | null;
}

// ============================================================================
// DEFAULT PAYMENTS
// ============================================================================

/**
 * Default pending payment
 */
export const defaultPendingPayment: PaymentFactoryOptions = {
  amount: 5000,
  currency: 'XOF',
  status: 'PENDING',
  paymentMethod: null,
  paytechRef: null,
  idempotencyKey: `idem-${crypto.randomUUID()}`,
  metadata: null,
};

/**
 * Default successful payment
 */
export const defaultSuccessfulPayment: PaymentFactoryOptions = {
  ...defaultPendingPayment,
  status: 'SUCCESS',
  paymentMethod: 'card',
  paytechRef: `paytech-${crypto.randomUUID()}`,
};

/**
 * Default failed payment
 */
export const defaultFailedPayment: PaymentFactoryOptions = {
  ...defaultPendingPayment,
  status: 'FAILED',
};

/**
 * Default refunded payment
 */
export const defaultRefundedPayment: PaymentFactoryOptions = {
  ...defaultSuccessfulPayment,
  status: 'REFUNDED',
};

// ============================================================================
// DEFAULT ESCROWS
// ============================================================================

/**
 * Default held escrow
 */
export const defaultHeldEscrow: EscrowFactoryOptions = {
  amount: 5000,
  workerAmount: 4500,
  commissionAmount: 500,
  status: 'HELD',
  releaseType: null,
  paytechRef: null,
  releasedAt: null,
};

/**
 * Default released escrow
 */
export const defaultReleasedEscrow: EscrowFactoryOptions = {
  ...defaultHeldEscrow,
  status: 'RELEASED',
  releaseType: 'FULL',
  releasedAt: new Date(),
};

/**
 * Default refunded escrow
 */
export const defaultRefundedEscrow: EscrowFactoryOptions = {
  ...defaultHeldEscrow,
  status: 'REFUNDED',
  releaseType: 'FULL',
  releasedAt: new Date(),
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a payment with custom options
 */
export const createPaymentFactory = (
  options: PaymentFactoryOptions = {}
): {
  id: string;
  missionId: string;
  clientId: string;
  workerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  paytechRef: string | null;
  idempotencyKey: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
} => {
  const now = new Date();
  return {
    id: options.id ?? `payment-${crypto.randomUUID()}`,
    missionId: options.missionId ?? `mission-${crypto.randomUUID()}`,
    clientId: options.clientId ?? `client-${crypto.randomUUID()}`,
    workerId: options.workerId ?? `worker-${crypto.randomUUID()}`,
    amount: options.amount ?? 5000,
    currency: options.currency ?? 'XOF',
    status: options.status ?? 'PENDING',
    paymentMethod: options.paymentMethod ?? null,
    paytechRef: options.paytechRef ?? null,
    idempotencyKey: options.idempotencyKey ?? `idem-${crypto.randomUUID()}`,
    metadata: options.metadata ?? null,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
  };
};

/**
 * Create an escrow with custom options
 */
export const createEscrowFactory = (
  options: EscrowFactoryOptions = {}
): {
  id: string;
  paymentId: string;
  missionId: string;
  amount: number;
  workerAmount: number;
  commissionAmount: number;
  status: EscrowStatus;
  releaseType: 'FULL' | 'PARTIAL' | null;
  paytechRef: string | null;
  createdAt: Date;
  updatedAt: Date;
  releasedAt: Date | null;
} => {
  const now = new Date();
  return {
    id: options.id ?? `escrow-${crypto.randomUUID()}`,
    paymentId: options.paymentId ?? `payment-${crypto.randomUUID()}`,
    missionId: options.missionId ?? `mission-${crypto.randomUUID()}`,
    amount: options.amount ?? 5000,
    workerAmount: options.workerAmount ?? 4500,
    commissionAmount: options.commissionAmount ?? 500,
    status: options.status ?? 'HELD',
    releaseType: options.releaseType ?? null,
    paytechRef: options.paytechRef ?? null,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
    releasedAt: options.releasedAt ?? null,
  };
};

// ============================================================================
// CONVENIENCE FACTORIES
// ============================================================================

/**
 * Create a pending payment
 */
export const createPendingPayment = (
  options: PaymentFactoryOptions = {}
): ReturnType<typeof createPaymentFactory> => {
  return createPaymentFactory({ ...defaultPendingPayment, ...options });
};

/**
 * Create a successful payment
 */
export const createSuccessfulPayment = (
  options: PaymentFactoryOptions = {}
): ReturnType<typeof createPaymentFactory> => {
  return createPaymentFactory({ ...defaultSuccessfulPayment, ...options });
};

/**
 * Create a failed payment
 */
export const createFailedPayment = (
  options: PaymentFactoryOptions = {}
): ReturnType<typeof createPaymentFactory> => {
  return createPaymentFactory({ ...defaultFailedPayment, ...options });
};

/**
 * Create a refunded payment
 */
export const createRefundedPayment = (
  options: PaymentFactoryOptions = {}
): ReturnType<typeof createPaymentFactory> => {
  return createPaymentFactory({ ...defaultRefundedPayment, ...options });
};

/**
 * Create a held escrow
 */
export const createHeldEscrow = (
  options: EscrowFactoryOptions = {}
): ReturnType<typeof createEscrowFactory> => {
  return createEscrowFactory({ ...defaultHeldEscrow, ...options });
};

/**
 * Create a released escrow
 */
export const createReleasedEscrow = (
  options: EscrowFactoryOptions = {}
): ReturnType<typeof createEscrowFactory> => {
  return createEscrowFactory({ ...defaultReleasedEscrow, ...options });
};

/**
 * Create a refunded escrow
 */
export const createRefundedEscrow = (
  options: EscrowFactoryOptions = {}
): ReturnType<typeof createEscrowFactory> => {
  return createEscrowFactory({ ...defaultRefundedEscrow, ...options });
};

/**
 * Calculate escrow amounts (90% worker, 10% commission)
 */
export const calculateEscrowAmounts = (
  amount: number
): { workerAmount: number; commissionAmount: number } => {
  const commissionAmount = Math.round(amount * 0.1);
  const workerAmount = amount - commissionAmount;
  return { workerAmount, commissionAmount };
};
