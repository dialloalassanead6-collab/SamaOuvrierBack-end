// ============================================================================
// USER FACTORY - TEST DATA FACTORY
// ============================================================================
// Factory for creating test user data
// ============================================================================

import type { Role, WorkerStatus } from '../__mocks__/prisma-client.js';
import crypto from 'crypto';

// Type for user factory options - using string for flexibility
export interface UserFactoryOptions {
  id?: string;
  nom?: string;
  prenom?: string;
  adresse?: string;
  tel?: string;
  email?: string;
  password?: string;
  role?: Role;
  workerStatus?: WorkerStatus | null;
  professionId?: string | null;
  isActive?: boolean;
  isBanned?: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Default client user
 */
export const defaultClientUser: UserFactoryOptions = {
  nom: 'Doe',
  prenom: 'John',
  adresse: '123 Test Street',
  tel: '+221771234567',
  email: 'client@test.com',
  password: 'hashed_password',
  role: 'CLIENT',
  workerStatus: null,
  professionId: null,
  isActive: true,
  isBanned: false,
  deletedAt: null,
};

/**
 * Default approved worker user
 */
export const defaultApprovedWorker: UserFactoryOptions = {
  nom: 'Smith',
  prenom: 'Jane',
  adresse: '456 Worker Avenue',
  tel: '+221778765432',
  email: 'worker@test.com',
  password: 'hashed_password',
  role: 'WORKER',
  workerStatus: 'APPROVED',
  professionId: 'profession-uuid',
  isActive: true,
  isBanned: false,
  deletedAt: null,
};

/**
 * Default pending worker user
 */
export const defaultPendingWorker: UserFactoryOptions = {
  nom: 'Dupont',
  prenom: 'Pierre',
  adresse: '789 Worker Lane',
  tel: '+221779999999',
  email: 'pending-worker@test.com',
  password: 'hashed_password',
  role: 'WORKER',
  workerStatus: 'PENDING',
  professionId: 'profession-uuid',
  isActive: true,
  isBanned: false,
  deletedAt: null,
};

/**
 * Default admin user
 */
export const defaultAdminUser: UserFactoryOptions = {
  nom: 'Admin',
  prenom: 'Super',
  adresse: 'Admin Street',
  tel: '+221770000000',
  email: 'admin@test.com',
  password: 'hashed_password',
  role: 'ADMIN',
  workerStatus: null,
  professionId: null,
  isActive: true,
  isBanned: false,
  deletedAt: null,
};

/**
 * Default banned user
 */
export const defaultBannedUser: UserFactoryOptions = {
  nom: 'Banned',
  prenom: 'User',
  adresse: 'Banned Street',
  tel: '+221771111111',
  email: 'banned@test.com',
  password: 'hashed_password',
  role: 'CLIENT',
  workerStatus: null,
  professionId: null,
  isActive: false,
  isBanned: true,
  deletedAt: null,
};

/**
 * Create a user with custom options
 */
export const createUserFactory = (
  options: UserFactoryOptions = {}
): {
  id: string;
  nom: string;
  prenom: string;
  adresse: string;
  tel: string;
  email: string;
  password: string;
  role: Role;
  workerStatus: WorkerStatus | null;
  professionId: string | null;
  isActive: boolean;
  isBanned: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
} => {
  const now = new Date();
  return {
    id: options.id ?? `user-${crypto.randomUUID()}`,
    nom: options.nom ?? 'Test',
    prenom: options.prenom ?? 'User',
    adresse: options.adresse ?? '123 Test Street',
    tel: options.tel ?? '+221771234567',
    email: options.email ?? `user-${Date.now()}@test.com`,
    password: options.password ?? 'hashed_password',
    role: options.role ?? 'CLIENT',
    workerStatus: options.workerStatus ?? null,
    professionId: options.professionId ?? null,
    isActive: options.isActive ?? true,
    isBanned: options.isBanned ?? false,
    deletedAt: options.deletedAt ?? null,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
  };
};

/**
 * Create a client user
 */
export const createClientUser = (
  options: UserFactoryOptions = {}
): ReturnType<typeof createUserFactory> => {
  return createUserFactory({ ...defaultClientUser, ...options });
};

/**
 * Create an approved worker user
 */
export const createApprovedWorker = (
  options: UserFactoryOptions = {}
): ReturnType<typeof createUserFactory> => {
  return createUserFactory({ ...defaultApprovedWorker, ...options });
};

/**
 * Create a pending worker user
 */
export const createPendingWorker = (
  options: UserFactoryOptions = {}
): ReturnType<typeof createUserFactory> => {
  return createUserFactory({ ...defaultPendingWorker, ...options });
};

/**
 * Create a rejected worker user
 */
export const createRejectedWorker = (
  options: UserFactoryOptions = {}
): ReturnType<typeof createUserFactory> => {
  return createUserFactory({
    ...defaultPendingWorker,
    workerStatus: 'REJECTED',
    ...options,
  });
};

/**
 * Create an admin user
 */
export const createAdminUser = (
  options: UserFactoryOptions = {}
): ReturnType<typeof createUserFactory> => {
  return createUserFactory({ ...defaultAdminUser, ...options });
};

/**
 * Create a banned user
 */
export const createBannedUser = (
  options: UserFactoryOptions = {}
): ReturnType<typeof createUserFactory> => {
  return createUserFactory({ ...defaultBannedUser, ...options });
};

/**
 * Create an inactive user
 */
export const createInactiveUser = (
  options: UserFactoryOptions = {}
): ReturnType<typeof createUserFactory> => {
  return createUserFactory({
    ...defaultClientUser,
    isActive: false,
    ...options,
  });
};
