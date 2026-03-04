// ============================================================================
// MOCK REPOSITORIES
// ============================================================================
// Mocks pour les repositories utilisés dans les tests
// Utilise 'any' pour les types pour éviter les erreurs de typage strict
// ============================================================================

import { vi, Mock } from 'vitest';
import type { IMissionRepository } from '../../src/modules/mission/application/mission.repository.interface.js';
import type { IServiceRepository } from '../../src/modules/service/application/service.repository.interface.js';
import type { IPaymentRepository } from '../../src/modules/payment/application/payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../../src/modules/payment/application/mission-repository.interface.js';
import { MissionStatus } from '../../src/modules/mission/domain/index.js';
import { PaymentStatus, EscrowStatus } from '../../src/modules/payment/domain/index.js';
import { createTestMission, createTestService, createTestPayment, createTestEscrow, generateTestId } from '../setup.js';

/**
 * Crée un mock de MissionRepository
 */
export const createMockMissionRepository = (): IMissionRepository => {
  const missions = new Map<string, ReturnType<typeof createTestMission>>();

  return {
    findById: vi.fn().mockImplementation(async (id) => missions.get(id) || null),
    findByIdWithDetails: vi.fn().mockImplementation(async (id) => missions.get(id) || null),
    findAll: vi.fn().mockImplementation(async () => ({ 
      missions: Array.from(missions.values()), 
      total: missions.size 
    })),
    findAllWithDetails: vi.fn().mockImplementation(async () => ({ 
      missions: Array.from(missions.values()), 
      total: missions.size 
    })),
    create: vi.fn().mockImplementation(async (data) => {
      const mission = createTestMission({
        ...data,
        id: generateTestId('mission'),
        status: MissionStatus.PENDING_PAYMENT,
      });
      missions.set(mission.id, mission);
      return mission;
    }),
    update: vi.fn().mockImplementation(async (id, mission: any) => {
      const existing = missions.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...(mission.toProps ? mission.toProps() : mission) };
      missions.set(id, updated);
      return updated;
    }),
    delete: vi.fn().mockImplementation(async (id) => {
      missions.delete(id);
      return Promise.resolve();
    }),
    verifyServiceOwnership: vi.fn().mockImplementation(async (serviceId, workerId) => {
      const service = createTestService({ id: serviceId, workerId });
      return service.workerId === workerId;
    }),
    findByClientId: vi.fn().mockImplementation(async (clientId) => 
      Array.from(missions.values()).filter(m => m.clientId === clientId)
    ),
    findByWorkerId: vi.fn().mockImplementation(async (workerId) => 
      Array.from(missions.values()).filter(m => m.workerId === workerId)
    ),
  } as unknown as IMissionRepository;
};

/**
 * Crée un mock de ServiceRepository
 */
export const createMockServiceRepository = (): IServiceRepository => {
  const services = new Map<string, ReturnType<typeof createTestService>>();

  return {
    findById: vi.fn().mockImplementation(async (id) => services.get(id) || null),
    findAll: vi.fn().mockImplementation(async (workerId, skip, take) => ({ 
      services: Array.from(services.values()), 
      total: services.size 
    })),
    create: vi.fn().mockImplementation(async (data) => {
      const service = createTestService({
        ...data,
        id: generateTestId('service'),
      });
      services.set(service.id, service);
      return service;
    }),
    update: vi.fn().mockImplementation(async (id, data: any) => {
      const existing = services.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data };
      services.set(id, updated);
      return updated;
    }),
    delete: vi.fn().mockImplementation(async (id) => {
      services.delete(id);
      return Promise.resolve();
    }),
    findByIdAndWorkerId: vi.fn().mockImplementation(async (id, workerId) => {
      const service = services.get(id);
      return service?.workerId === workerId ? service : null;
    }),
  } as unknown as IServiceRepository;
};

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

// Export factory functions
export const mocks = {
  missionRepository: createMockMissionRepository,
  serviceRepository: createMockServiceRepository,
  paymentRepository: createMockPaymentRepository,
  missionRepositoryForPayment: createMockMissionRepositoryForPayment,
};
