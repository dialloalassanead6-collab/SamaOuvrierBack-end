// ============================================================================
// MOCK PRISMA CLIENT
// ============================================================================
// Mock du client Prisma pour les tests
// Exporte tous les enums et types nécessaires aux tests
// ============================================================================

import { vi } from 'vitest';

/**
 * Enum Role - Définit les rôles utilisateur dans l'application
 */
export const Role = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  WORKER: 'WORKER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * Enum WorkerStatus - Définit le statut d'un worker
 */
export const WorkerStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BANNED: 'BANNED',
} as const;

export type WorkerStatus = (typeof WorkerStatus)[keyof typeof WorkerStatus];

/**
 * Enum MissionStatus - Définit les statuts d'une mission
 */
export const MissionStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_ACCEPT: 'PENDING_ACCEPT',
  CONTACT_UNLOCKED: 'CONTACT_UNLOCKED',
  NEGOTIATION_DONE: 'NEGOTIATION_DONE',
  IN_PROGRESS: 'IN_PROGRESS',
  CANCEL_REQUESTED: 'CANCEL_REQUESTED',
  AWAITING_FINAL_PAYMENT: 'AWAITING_FINAL_PAYMENT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUSED: 'REFUSED',
} as const;

export type MissionStatus = (typeof MissionStatus)[keyof typeof MissionStatus];

/**
 * Enum PaymentStatus - Définit les statuts d'un paiement
 */
export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Enum EscrowStatus - Définit les statuts de l'escrow
 */
export const EscrowStatus = {
  PENDING: 'PENDING',
  HELD: 'HELD',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type EscrowStatus = (typeof EscrowStatus)[keyof typeof EscrowStatus];

/**
 * Enum DisputeStatus - Définit les statuts d'un litige
 */
export const DisputeStatus = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];

/**
 * Enum UserStatus - Définit le statut global d'un utilisateur
 */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
  DELETED: 'DELETED',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/**
 * Enum DisputeReason - Définit les raisons d'un litige
 */
export const DisputeReason = {
  PAYMENT_ISSUE: 'PAYMENT_ISSUE',
  WORK_NOT_DONE: 'WORK_NOT_DONE',
  QUALITY_UNSATISFACTORY: 'QUALITY_UNSATISFACTORY',
  NO_SHOW: 'NO_SHOW',
  CANCELLATION_ISSUE: 'CANCELLATION_ISSUE',
  COMMUNICATION_ISSUE: 'COMMUNICATION_ISSUE',
  OTHER: 'OTHER',
} as const;

export type DisputeReason = (typeof DisputeReason)[keyof typeof DisputeReason];

/**
 * Enum DisputeResolution - Définit les résolutions possibles d'un litige
 */
export const DisputeResolution = {
  CLIENT_WINS: 'CLIENT_WINS',
  WORKER_WINS: 'WORKER_WINS',
  PARTIAL_REFUND: 'PARTIAL_REFUND',
  FULL_REFUND: 'FULL_REFUND',
  NO_REFUND: 'NO_REFUND',
  DRAW: 'DRAW',
} as const;

export type DisputeResolution = (typeof DisputeResolution)[keyof typeof DisputeResolution];

/**
 * Crée une implémentation mock du client Prisma
 * Utilisé pour les tests qui ont besoin d'une instance Prisma complète
 */
export const createMockPrismaClient = (): any => {
  return {
    role: Role,
    workerStatus: WorkerStatus,
    missionStatus: MissionStatus,
    paymentStatus: PaymentStatus,
    escrowStatus: EscrowStatus,
    disputeStatus: DisputeStatus,
    userStatus: UserStatus,
    // Méthodes mockées pour les repositories
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mission: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    escrow: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    dispute: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    profession: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((callback: any) => callback(createMockPrismaClient())),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
};

// Export par défaut pour compatibilité
export default {
  Role,
  WorkerStatus,
  MissionStatus,
  PaymentStatus,
  EscrowStatus,
  DisputeStatus,
  DisputeReason,
  DisputeResolution,
  UserStatus,
};
