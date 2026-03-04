// ============================================================================
// PAYMENT MOCKS
// ============================================================================
// Mocks pour les tests de payment
// ============================================================================

import { vi } from 'vitest';
import type { IPaymentRepository } from '../../src/modules/payment/application/payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../../src/modules/payment/application/mission-repository.interface.js';
import { PaymentStatus, EscrowStatus } from '../../src/modules/payment/domain/index.js';
import { createTestPayment, createTestEscrow, createTestMission, generateTestId } from '../setup.js';

/**
 * Crée un mock de PaymentRepository
 */
export const createMockPaymentRepository = (): IPaymentRepository => {
  const payments = new Map<string, ReturnType<typeof createTestPayment>>();
  const escrows = new Map<string, ReturnType<typeof createTestEscrow>>();

  return {
    // Payment methods
    savePaymentWithEscrow: vi.fn().mockImplementation(async (payment: any, escrow: any) => {
      payments.set(payment.id, { ...payment, amount: Number(payment.amount) });
      escrows.set(escrow.id, escrow);
      return { payment, escrow };
    }),
    findPaymentById: vi.fn().mockImplementation(async (id) => payments.get(id) || null),
    findPaymentByIdempotencyKey: vi.fn().mockImplementation(async (key) => 
      Array.from(payments.values()).find(p => p.idempotencyKey === key) || null
    ),
    findPaymentByMissionId: vi.fn().mockImplementation(async (missionId) => 
      Array.from(payments.values()).find(p => p.missionId === missionId) || null
    ),
    findPaymentByPaytechRef: vi.fn().mockImplementation(async (ref) => 
      Array.from(payments.values()).find(p => p.paytechRef === ref) || null
    ),
    createPayment: vi.fn().mockImplementation(async (input: any) => {
      const payment = createTestPayment({
        ...input,
        id: generateTestId('payment'),
      });
      payments.set(payment.id, payment);
      return payment;
    }),
    updatePayment: vi.fn().mockImplementation(async (id, payment: any) => {
      const existing = payments.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...payment.toProps ? payment.toProps() : payment };
      payments.set(id, updated);
      return updated;
    }),

    // Escrow methods
    findEscrowById: vi.fn().mockImplementation(async (id) => escrows.get(id) || null),
    findEscrowByMissionId: vi.fn().mockImplementation(async (missionId) => 
      Array.from(escrows.values()).find(e => e.missionId === missionId) || null
    ),
    findEscrowByPaymentId: vi.fn().mockImplementation(async (paymentId) => 
      Array.from(escrows.values()).find(e => e.paymentId === paymentId) || null
    ),
    createEscrow: vi.fn().mockImplementation(async (input: any) => {
      const escrow = createTestEscrow({
        ...input,
        id: generateTestId('escrow'),
      });
      escrows.set(escrow.id, escrow);
      return escrow;
    }),
    updateEscrow: vi.fn().mockImplementation(async (id, escrow: any) => {
      const existing = escrows.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...escrow.toProps ? escrow.toProps() : escrow };
      escrows.set(id, updated);
      return updated;
    }),

    // Transaction methods
    updateAfterRelease: vi.fn().mockImplementation(async (paymentId, escrowId, payment: any, escrow: any) => {
      payments.set(paymentId, { ...payment, amount: Number(payment.amount) });
      escrows.set(escrowId, escrow);
      return Promise.resolve();
    }),
    updateAfterRefund: vi.fn().mockImplementation(async (paymentId, escrowId, payment: any, escrow: any) => {
      payments.set(paymentId, { ...payment, status: PaymentStatus.REFUNDED });
      escrows.set(escrowId, escrow);
      return Promise.resolve();
    }),
  } as unknown as IPaymentRepository;
};

/**
 * Crée un mock de MissionRepositoryForPayment
 */
export const createMockMissionRepositoryForPayment = (): IMissionRepositoryForPayment => {
  const missions = new Map<string, ReturnType<typeof createTestMission>>();

  return {
    findById: vi.fn().mockImplementation(async (id) => missions.get(id) || null),
    updateStatus: vi.fn().mockImplementation(async (id, status) => {
      const mission = missions.get(id);
      if (!mission) return null;
      const updated = { ...mission, status };
      missions.set(id, updated);
      return updated;
    }),
    markClientConfirmed: vi.fn().mockImplementation(async (id) => {
      const mission = missions.get(id);
      if (!mission) return null;
      const updated = { ...mission, clientConfirmed: true };
      missions.set(id, updated);
      return updated;
    }),
    markWorkerConfirmed: vi.fn().mockImplementation(async (id) => {
      const mission = missions.get(id);
      if (!mission) return null;
      const updated = { ...mission, workerConfirmed: true };
      missions.set(id, updated);
      return updated;
    }),
    hasBothConfirmed: vi.fn().mockImplementation(async (id) => {
      const mission = missions.get(id);
      if (!mission) return false;
      return mission.clientConfirmed && mission.workerConfirmed;
    }),
  } as unknown as IMissionRepositoryForPayment;
};

/**
 * Crée un mock de PayTechService
 */
export const createMockPayTechService = () => {
  return {
    verifyWebhookSignature: vi.fn().mockImplementation((rawBody: string, signature: string) => {
      return { isValid: true };
    }),
    processWebhook: vi.fn().mockImplementation((payload: any) => {
      return {
        refCommand: payload.ref_command || 'test-ref',
        status: payload.status || 'SUCCESS',
        amount: payload.amount || 5000,
      };
    }),
    createPayment: vi.fn().mockImplementation(async (input: any) => {
      return {
        paymentUrl: 'https://paytech.example.com/pay/test-token',
        token: 'test-token',
      };
    }),
  };
};

// Export factory
export const paymentMocks = {
  createMockPaymentRepository,
  createMockMissionRepositoryForPayment,
  createMockPayTechService,
};
