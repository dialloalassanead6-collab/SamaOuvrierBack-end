// ============================================================================
// AUTH HELPER - TEST UTILITIES
// ============================================================================
// Helper functions for authentication in tests
// ============================================================================

import jwt from 'jsonwebtoken';
import type { Role, WorkerStatus } from '../__mocks__/prisma-client.js';

// JWT secret for testing (must match setup.ts)
const TEST_JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-32chars';

/**
 * Generate a test JWT token
 */
export const generateTestToken = (
  userId: string,
  email: string,
  role: Role,
  options?: {
    expiresIn?: string;
    workerStatus?: WorkerStatus;
  }
): string => {
  const payload = {
    sub: userId,
    email,
    role,
    workerStatus: options?.workerStatus ?? null,
  };

  return jwt.sign(payload, TEST_JWT_SECRET, {
    expiresIn: options?.expiresIn ?? '1h',
  } as jwt.SignOptions);
};

/**
 * Generate a test token for a client
 */
export const generateClientToken = (clientId: string = 'client-id'): string => {
  return generateTestToken(clientId, 'client@test.com', 'CLIENT');
};

/**
 * Generate a test token for an approved worker
 */
export const generateWorkerToken = (workerId: string = 'worker-id'): string => {
  return generateTestToken(workerId, 'worker@test.com', 'WORKER', {
    workerStatus: 'APPROVED',
  });
};

/**
 * Generate a test token for a pending worker
 */
export const generatePendingWorkerToken = (workerId: string = 'worker-id'): string => {
  return generateTestToken(workerId, 'pending-worker@test.com', 'WORKER', {
    workerStatus: 'PENDING',
  });
};

/**
 * Generate a test token for an admin
 */
export const generateAdminToken = (adminId: string = 'admin-id'): string => {
  return generateTestToken(adminId, 'admin@test.com', 'ADMIN');
};

/**
 * Generate a banned user token
 */
export const generateBannedUserToken = (userId: string = 'banned-user-id'): string => {
  return generateTestToken(userId, 'banned@test.com', 'CLIENT');
};

/**
 * Decode a JWT token (for testing purposes)
 */
export const decodeTestToken = (token: string): Record<string, unknown> | null => {
  try {
    return jwt.verify(token, TEST_JWT_SECRET) as Record<string, unknown>;
  } catch {
    return null;
  }
};

/**
 * Create mock authenticated request
 */
export const createAuthenticatedRequest = (
  user: {
    id: string;
    email: string;
    role: Role;
    workerStatus?: WorkerStatus;
  }
): { user: { id: string; email: string; role: Role; workerStatus: WorkerStatus | null } } => {
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      workerStatus: user.workerStatus ?? null,
    },
  };
};

/**
 * Auth header generator
 */
export const getAuthHeader = (token: string): { Authorization: string } => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

export { TEST_JWT_SECRET };
