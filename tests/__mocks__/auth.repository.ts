// ============================================================================
// AUTH MOCK REPOSITORY
// ============================================================================
// Mock pour le repository d'authentification utilisé dans les tests
// ============================================================================

import { vi } from 'vitest';
import type { IAuthRepository, CreateUserData } from '../../src/modules/auth/application/auth.repository.interface.js';
import type { RegisteredUser, UserWithPassword, ProfessionEntity } from '../../src/modules/auth/domain/auth.types.js';
import { Role, WorkerStatus } from '@prisma/client';
import { generateTestId } from '../setup.js';

/**
 * Crée un mock de AuthRepository
 */
export const createMockAuthRepository = (): IAuthRepository => {
  const users = new Map<string, UserWithPassword>();
  const professions = new Map<string, ProfessionEntity>();

  // Pré-remplir avec une profession de test
  const testProfession: ProfessionEntity = {
    id: generateTestId('profession'),
    name: 'Plombier',
    description: 'Professionnel de la plomberie',
  };
  professions.set(testProfession.id, testProfession);

  return {
    findByEmailWithPassword: vi.fn().mockImplementation(async (email: string) => {
      for (const user of users.values()) {
        if (user.email === email) return user;
      }
      return null;
    }),

    findById: vi.fn().mockImplementation(async (id: string) => {
      const user = users.get(id);
      if (!user) return null;
      return {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        adresse: user.adresse,
        tel: user.tel,
        email: user.email,
        role: user.role,
        workerStatus: user.workerStatus,
        professionId: user.professionId,
        createdAt: user.createdAt,
      };
    }),

    existsByEmail: vi.fn().mockImplementation(async (email: string) => {
      for (const user of users.values()) {
        if (user.email === email) return true;
      }
      return false;
    }),

    createUser: vi.fn().mockImplementation(async (data: CreateUserData): Promise<RegisteredUser> => {
      const user: UserWithPassword = {
        id: generateTestId('user'),
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        tel: data.tel,
        email: data.email,
        password: data.password,
        role: data.role,
        workerStatus: data.workerStatus || null,
        professionId: data.professionId || null,
        isActive: true,
        isBanned: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(user.id, user);
      return {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        adresse: user.adresse,
        tel: user.tel,
        email: user.email,
        role: user.role,
        workerStatus: user.workerStatus,
        professionId: user.professionId,
        createdAt: user.createdAt,
      };
    }),

    findProfessionById: vi.fn().mockImplementation(async (id: string) => {
      return professions.get(id) || null;
    }),

    hasAnyProfession: vi.fn().mockImplementation(async () => {
      return professions.size > 0;
    }),
  } as unknown as IAuthRepository;
};

/**
 * Crée un utilisateur de test avec mot de passe hashé
 */
export const createTestUserWithPassword = (overrides: Partial<UserWithPassword> = {}): UserWithPassword => {
  return {
    id: generateTestId('user'),
    nom: 'Doe',
    prenom: 'John',
    adresse: '123 Test Street',
    tel: '+221771234567',
    email: 'test@example.com',
    password: '$2a$12$hashedpassword1234567890123456789012345678901234567890', // Fake bcrypt hash
    role: Role.CLIENT,
    workerStatus: null,
    professionId: null,
    isActive: true,
    isBanned: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * Factory pour créer des utilisateurs de test avec différents statuts
 */
export const createTestClient = (email = 'client@test.com'): UserWithPassword => {
  return createTestUserWithPassword({
    email,
    role: Role.CLIENT,
    workerStatus: null,
  });
};

export const createTestWorkerApproved = (email = 'worker@test.com'): UserWithPassword => {
  return createTestUserWithPassword({
    email,
    role: Role.WORKER,
    workerStatus: WorkerStatus.APPROVED,
  });
};

export const createTestWorkerPending = (email = 'worker-pending@test.com'): UserWithPassword => {
  return createTestUserWithPassword({
    email,
    role: Role.WORKER,
    workerStatus: WorkerStatus.PENDING,
  });
};

export const createTestWorkerRejected = (email = 'worker-rejected@test.com'): UserWithPassword => {
  return createTestUserWithPassword({
    email,
    role: Role.WORKER,
    workerStatus: WorkerStatus.REJECTED,
  });
};

export const createTestBannedUser = (email = 'banned@test.com'): UserWithPassword => {
  return createTestUserWithPassword({
    email,
    isBanned: true,
  });
};

export const createTestDeletedUser = (email = 'deleted@test.com'): UserWithPassword => {
  return createTestUserWithPassword({
    email,
    deletedAt: new Date(),
  });
};

// Export factory
export const authMocks = {
  createMockAuthRepository,
  createTestUserWithPassword,
  createTestClient,
  createTestWorkerApproved,
  createTestWorkerPending,
  createTestWorkerRejected,
  createTestBannedUser,
  createTestDeletedUser,
};
