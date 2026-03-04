// ============================================================================
// VITEST SETUP FILE
// ============================================================================
// Configuration globale pour les tests Vitest
// ============================================================================

import { vi } from 'vitest';
import crypto from 'crypto';

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
 */
export const createTestMission = (overrides: Record<string, unknown> = {}) => ({
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
  status: 'PENDING_PAYMENT',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

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
 */
export const createTestPayment = (overrides: Record<string, unknown> = {}) => ({
  id: generateTestId('payment'),
  missionId: generateTestId('mission'),
  clientId: generateTestId('client'),
  workerId: generateTestId('worker'),
  amount: 5000,
  currency: 'XOF',
  status: 'PENDING',
  paymentMethod: null,
  paytechRef: null,
  idempotencyKey: generateTestId('idem'),
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Factory pour créer des données de test pour Escrow
 */
export const createTestEscrow = (overrides: Record<string, unknown> = {}) => ({
  id: generateTestId('escrow'),
  paymentId: generateTestId('payment'),
  missionId: generateTestId('mission'),
  amount: 5000,
  workerAmount: 4500,
  commissionAmount: 500,
  status: 'HELD',
  releaseType: null,
  paytechRef: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  releasedAt: null,
  ...overrides,
});

// ============================================================================
// RE-EXPORT FOR CONVENIENCE
// ============================================================================

export { vi };
