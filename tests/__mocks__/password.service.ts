// ============================================================================
// PASSWORD SERVICE MOCK
// ============================================================================
// Mock pour le service de mot de passe utilisé dans les tests
// ============================================================================

import { vi } from 'vitest';
import type { IPasswordService } from '../../src/shared/security/password.service.js';

/**
 * Crée un mock de PasswordService
 * Par défaut, compare retourne true si le mot de passe est 'validPassword'
 */
export const createMockPasswordService = (): IPasswordService => {
  return {
    hash: vi.fn().mockImplementation(async (password: string) => {
      // Simule le hashage - en réalité, cela utiliserait bcrypt
      return `hashed_${password}_${Date.now()}`;
    }),

    compare: vi.fn().mockImplementation(async (password: string, hashedPassword: string) => {
      // Par défaut, retourne true pour 'validPassword'
      // ou si le hashedPassword commence par 'hashed_'
      if (password === 'validPassword') return true;
      if (hashedPassword.startsWith('hashed_')) return true;
      if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
        // Pour les hashes bcrypt réels, on simule la vérification
        // Dans un vrai test, on utiliserait bcrypt pour générer le hash
        return password === 'validPassword';
      }
      return false;
    }),
  };
};

/**
 * Crée un mock de PasswordService qui retourne toujours true pour compare
 */
export const createLenientMockPasswordService = (): IPasswordService => {
  return {
    hash: vi.fn().mockImplementation(async (password: string) => {
      return `hashed_${password}`;
    }),

    compare: vi.fn().mockImplementation(async () => {
      return true;
    }),
  };
};

/**
 * Crée un mock de PasswordService qui retourne toujours false pour compare
 */
export const createStrictMockPasswordService = (): IPasswordService => {
  return {
    hash: vi.fn().mockImplementation(async (password: string) => {
      return `hashed_${password}`;
    }),

    compare: vi.fn().mockImplementation(async () => {
      return false;
    }),
  };
};

// Export factory
export const passwordServiceMocks = {
  createMockPasswordService,
  createLenientMockPasswordService,
  createStrictMockPasswordService,
};
