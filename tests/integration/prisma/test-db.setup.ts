// ============================================================================
// INTEGRATION TEST DATABASE SETUP
// ============================================================================
// Configuration pour les tests d'intégration
// NOTE: Ces tests nécessitent que Prisma Client soit généré avec: npm run prisma:generate
// ============================================================================

import { vi, beforeEach, afterEach, afterAll } from 'vitest';

// ============================================================================
// MOCK PRISMA FOR INTEGRATION TESTS
// ============================================================================
// Since Prisma Client may not be generated, we use mocks for integration tests
// In a real CI/CD pipeline, you would generate the Prisma client first
// ============================================================================

// Mock the Prisma client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    user: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    profession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    service: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    mission: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    escrow: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  })),
}));

// ============================================================================
// DATABASE CLEANUP HELPERS
// ============================================================================

/**
 * Clean all test data (uses mocks)
 */
export const cleanTestDatabase = async (): Promise<void> => {
  // This would clean the database in a real setup
  // For now, it's handled by the mocks
  vi.clearAllMocks();
};

/**
 * Setup test hooks
 */
beforeEach(async () => {
  vi.clearAllMocks();
});

afterEach(async () => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
});

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

/**
 * Create mock user data
 */
export const createMockUserData = (role: 'CLIENT' | 'WORKER' | 'ADMIN' = 'CLIENT') => ({
  nom: 'Test',
  prenom: 'User',
  adresse: '123 Test Street',
  tel: '+221771234567',
  email: `test.${Date.now()}@example.com`,
  password: 'hashed_password',
  role,
  workerStatus: role === 'WORKER' ? 'APPROVED' : null,
});

/**
 * Create mock service data
 */
export const createMockServiceData = (workerId: string) => ({
  title: 'Test Service',
  description: 'Description du service de test',
  minPrice: 5000,
  maxPrice: 20000,
  workerId,
});

/**
 * Create mock mission data
 */
export const createMockMissionData = (clientId: string, workerId: string, serviceId: string) => ({
  clientId,
  workerId,
  serviceId,
  prixMin: 5000,
  prixMax: 10000,
  status: 'PENDING_PAYMENT',
});

/**
 * Create mock payment data
 */
export const createMockPaymentData = (missionId: string, clientId: string, workerId: string) => ({
  missionId,
  clientId,
  workerId,
  amount: 5000,
  currency: 'XOF',
  status: 'PENDING',
  idempotencyKey: `idem-${Date.now()}`,
});

/**
 * Create mock escrow data
 */
export const createMockEscrowData = (paymentId: string, missionId: string) => ({
  paymentId,
  missionId,
  amount: 5000,
  workerAmount: 4500,
  commissionAmount: 500,
  status: 'HELD',
});

export { vi };
