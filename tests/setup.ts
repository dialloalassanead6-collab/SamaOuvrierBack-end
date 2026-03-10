// ============================================================================
// VITEST SETUP FILE
// ============================================================================
// Configuration globale pour les tests Vitest
// ============================================================================

import { vi, beforeEach, afterEach, afterAll } from 'vitest';
import crypto from 'crypto';
import { EscrowStatus } from '../src/modules/payment/domain/index.js';
import { MissionStatus } from '../src/modules/mission/domain/index.js';
import { PaymentStatus } from '../src/modules/payment/domain/index.js';

// ============================================================================
// CRYPTO GLOBAL MOCK
// ============================================================================
// Mock global pour crypto (nécessaire pour UUID et randomUUID)
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (arr: Uint8Array<ArrayBuffer>) => crypto.getRandomValues(arr),
  },
  writable: true,
});

// ============================================================================
// ENVIRONMENT VARIABLES FOR TESTS
// ============================================================================
process.env.NODE_ENV = 'test';
// JWT_SECRET must be at least 32 characters as per config.ts requirement
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-32chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.PAYTECH_API_KEY = 'test-api-key';
process.env.PAYTECH_API_SECRET = 'test-api-secret';
process.env.PAYTECH_ENV = 'test';

// ============================================================================
// VITEST HOOKS
// ============================================================================

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  vi.resetAllMocks();
  
  // Reset environment
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});

afterAll(() => {
  // Cleanup global state after all tests
  vi.resetAllMocks();
});

// ============================================================================
// MOCK HELPERS
// ============================================================================

/**
 * Crée un mock de date
 */
export const mockDate = (dateString: string = '2024-01-01'): Date => {
  return new Date(dateString);
};

/**
 * Génère un UUID de test
 */
export const generateTestId = (prefix: string = 'test'): string => {
  return `${prefix}-${crypto.randomUUID()}`;
};

/**
 * Crée un objet simulant une réponse HTTP Express
 */
export const createMockResponse = () => {
  const res: Record<string, unknown> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    statusCode: 200,
  };
  
  return res as unknown as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    statusCode: number;
  };
};

/**
 * Crée un objet simulant une requête HTTP Express
 */
export const createMockRequest = (overrides: Record<string, unknown> = {}): Record<string, unknown> => {
  return {
    body: {},
    params: {},
    query: {},
    user: null,
    pagination: { page: 1, pageSize: 10, skip: 0, take: 10 },
    ...overrides,
  };
};

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

/**
 * Factory pour créer des données de test pour Mission
 * Inclut les méthodes nécessaires pour les tests
 */
export const createTestMission = (overrides: Record<string, unknown> = {}) => {
  const status = (overrides.status as MissionStatus) || MissionStatus.PENDING_PAYMENT;
  return {
    id: generateTestId('mission'),
    clientId: generateTestId('client'),
    workerId: generateTestId('worker'),
    serviceId: generateTestId('service'),
    prixMin: 5000,
    prixMax: 10000,
    prixFinal: null,
    montantRestant: null,
    cancellationRequestedBy: null,
    clientConfirmed: false,
    workerConfirmed: false,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Méthodes nécessaires pour les tests
    canCancel: () => status === MissionStatus.PENDING_PAYMENT || status === MissionStatus.PENDING_ACCEPT,
    canRequestCancellation: () => status === MissionStatus.IN_PROGRESS,
    confirmInitialPayment: () => ({ ...overrides, status: MissionStatus.PENDING_ACCEPT }),
    acceptMission: () => ({ ...overrides, status: MissionStatus.CONTACT_UNLOCKED }),
    refuseMission: () => ({ ...overrides, status: MissionStatus.REFUSED }),
    setFinalPrice: (price: number) => ({ ...overrides, prixFinal: price, status: MissionStatus.NEGOTIATION_DONE }),
    completeByClient: () => ({ ...overrides, clientConfirmed: true }),
    completeByWorker: () => ({ ...overrides, workerConfirmed: true, status: MissionStatus.COMPLETED }),
    cancel: () => ({ ...overrides, status: MissionStatus.CANCELLED }),
    requestCancellation: (by: string) => ({ ...overrides, cancellationRequestedBy: by, status: MissionStatus.CANCEL_REQUESTED }),
    toResponse: function() { return this; },
    ...overrides,
  };
};

/**
 * Factory pour créer des données de test pour Service
 */
export const createTestService = (overrides: Record<string, unknown> = {}) => ({
  id: generateTestId('service'),
  title: 'Test Service',
  description: 'Description du service de test',
  minPrice: 5000,
  maxPrice: 20000,
  workerId: generateTestId('worker'),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Factory pour créer des données de test pour User
 */
export const createTestUser = (overrides: Record<string, unknown> = {}) => ({
  id: generateTestId('user'),
  nom: 'Doe',
  prenom: 'John',
  adresse: '123 Test Street',
  tel: '+221771234567',
  email: 'test@example.com',
  password: 'hashed_password',
  role: 'CLIENT',
  workerStatus: null,
  isActive: true,
  isBanned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Factory pour créer des données de test pour Payment
 * Inclut les méthodes nécessaires pour les tests
 */
export const createTestPayment = (overrides: Record<string, unknown> = {}) => {
  const status = (overrides.status as PaymentStatus) || PaymentStatus.PENDING;
  const payment: any = {
    id: generateTestId('payment'),
    missionId: generateTestId('mission'),
    clientId: generateTestId('client'),
    workerId: generateTestId('worker'),
    amount: 5000,
    currency: 'XOF',
    status,
    paymentMethod: null,
    paytechRef: null,
    idempotencyKey: generateTestId('idem'),
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Méthodes de transition
    markAsSuccess: function(paytechRef?: string) {
      return { ...this, status: PaymentStatus.SUCCESS, paytechRef };
    },
    markAsFailed: function() {
      return { ...this, status: PaymentStatus.FAILED };
    },
    markAsRefunded: function() {
      return { ...this, status: PaymentStatus.REFUNDED };
    },
    cancel: function() {
      return { ...this, status: PaymentStatus.CANCELLED };
    },
    // Méthodes de vérification
    isPending: () => status === PaymentStatus.PENDING,
    isSuccessful: () => status === PaymentStatus.SUCCESS,
    canBeRefunded: () => status === PaymentStatus.SUCCESS,
    toProps: function() { return this; },
    toResponse: function() { return this; },
  };
  return { ...payment, ...overrides };
};

/**
 * Factory pour créer des données de test pour Escrow
 * Inclut les méthodes necesarias pour les tests d'escrow
 */
export const createTestEscrow = (overrides: Record<string, unknown> = {}) => {
  const status = (overrides.status as EscrowStatus) || EscrowStatus.HELD;
  const amount = (overrides.amount as number) || 5000;
  const workerAmount = (overrides.workerAmount as number) || amount * 0.9;
  const commissionAmount = (overrides.commissionAmount as number) || amount * 0.1;
  
  const escrow: any = {
    id: generateTestId('escrow'),
    paymentId: generateTestId('payment'),
    missionId: generateTestId('mission'),
    amount,
    workerAmount,
    commissionAmount,
    status,
    releaseType: null,
    paytechRef: null,
    releasedBy: null,
    releaseReason: null,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    releasedAt: null,
    // Méthodes de vérification de statut
    isHeld: () => status === EscrowStatus.HELD,
    isReleased: () => status === EscrowStatus.RELEASED,
    isRefunded: () => status === EscrowStatus.REFUNDED,
    isPartiallyRefunded: () => status === EscrowStatus.PARTIALLY_REFUNDED,
    canTransitionTo: () => true,
    // Méthodes de transition
    hold: function(paytechRef?: string) {
      return { ...this, status: EscrowStatus.HELD, paytechRef };
    },
    release: function(releasedBy: string, reason?: string) {
      return { ...this, status: EscrowStatus.RELEASED, releasedBy, releaseReason: reason, releasedAt: new Date() };
    },
    fullRefund: function(refundRef?: string) {
      return { ...this, status: EscrowStatus.REFUNDED, releasedAt: new Date() };
    },
    partialRefund: function(percentage: number, clientAmount: number) {
      return { ...this, status: EscrowStatus.PARTIALLY_REFUNDED, releasedAt: new Date() };
    },
    // Méthodes utilitaires
    getCommissionPercent: () => (commissionAmount / amount) * 100,
    toProps: function() { return this; },
    toResponse: function() { return this; },
  };
  
  return { ...escrow, ...overrides };
};

// ============================================================================
// RE-EXPORT FOR CONVENIENCE
// ============================================================================

export { vi };
