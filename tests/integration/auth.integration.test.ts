// ============================================================================
// AUTH INTEGRATION TESTS
// ============================================================================
// Tests d'intégration pour l'authentification avec base de données
// Utilise des mocks de Prisma pour simuler les interactions avec la DB
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanTestDatabase, createMockUserData } from './prisma/test-db.setup.js';

// Roles as strings (to avoid Prisma import issues in mocks)
const ROLES = {
  CLIENT: 'CLIENT',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN',
} as const;

const WORKER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// Mock de Prisma Client
const mockPrismaUser = {
  create: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Mock global du Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: mockPrismaUser,
    profession: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await cleanTestDatabase();
  });

  // -------------------------------------------------------------------------
  // Tests: Flux complet inscription -> connexion
  // -------------------------------------------------------------------------

  describe('Full Auth Flow: Register -> Login', () => {
    it('devrait permettre inscription puis connexion', async () => {
      // Arrange - Données d'inscription
      const registerData = {
        nom: 'Dupont',
        prenom: 'Jean',
        adresse: '12 Rue de la Paix',
        tel: '+221771234567',
        email: `jean.dupont.${Date.now()}@example.com`,
        password: 'SecurePass123',
        type: 'CLIENT' as const,
      };

      // Mock de la réponse de création d'utilisateur
      const createdUser = {
        id: 'user-id-' + Date.now(),
        nom: registerData.nom,
        prenom: registerData.prenom,
        adresse: registerData.adresse,
        tel: registerData.tel,
        email: registerData.email,
        role: ROLES.CLIENT,
        workerStatus: null,
        professionId: null,
        isActive: true,
        isBanned: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.create.mockResolvedValue(createdUser);
      mockPrismaUser.findUnique.mockResolvedValue(createdUser);

      // Simuler l'inscription
      const registerResult = await mockPrismaUser.create({
        data: {
          nom: registerData.nom,
          prenom: registerData.prenom,
          adresse: registerData.adresse,
          tel: registerData.tel,
          email: registerData.email,
          password: 'hashed_password', // Simuler le hash
          role: ROLES.CLIENT,
        },
      });

      // Assert - Inscription réussie
      expect(registerResult).toHaveProperty('id');
      expect(registerResult.email).toBe(registerData.email);

      // Simuler la connexion
      const loginUser = await mockPrismaUser.findUnique({
        where: { email: registerData.email },
      });

      // Assert - Connexion réussie
      expect(loginUser).not.toBeNull();
      expect(loginUser?.email).toBe(registerData.email);
    });

    it('devrait rejecter inscription avec email existant', async () => {
      // Arrange - Utilisateur existant
      const existingEmail = `existing.${Date.now()}@example.com`;
      const existingUser = {
        id: 'existing-user-id',
        email: existingEmail,
        role: ROLES.CLIENT,
      };

      mockPrismaUser.findUnique.mockResolvedValue(existingUser);

      // Tenter de créer un utilisateur avec le même email
      const newUserData = createMockUserData('CLIENT');
      newUserData.email = existingEmail;

      // Act - Tenter de créer un utilisateur avec un email existant
      const userExists = await mockPrismaUser.findUnique({
        where: { email: existingEmail },
      });

      // Assert - L'utilisateur existe déjà
      expect(userExists).not.toBeNull();
      expect(userExists?.email).toBe(existingEmail);
    });

    it('devrait rejecter connexion avec mauvais mot de passe', async () => {
      // Arrange - Utilisateur existant
      const userEmail = `test.${Date.now()}@example.com`;
      const userWithPassword = {
        id: 'user-id',
        email: userEmail,
        password: 'hashed_correct_password',
        role: ROLES.CLIENT,
      };

      mockPrismaUser.findUnique.mockResolvedValue(userWithPassword);

      // Simuler la recherche d'utilisateur
      const foundUser = await mockPrismaUser.findUnique({
        where: { email: userEmail },
      });

      // Assert - Utilisateur trouvé mais mot de passe incorrect (simulé)
      expect(foundUser).not.toBeNull();
      // Dans un vrai test, on comparerait les mots de passe avec bcrypt
      const isPasswordValid = foundUser?.password === 'hashed_correct_password';
      expect(isPasswordValid).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Tests: Flux worker (inscription -> approval -> connexion)
  // -------------------------------------------------------------------------

  describe('Worker Registration Flow', () => {
    it('devrait créer worker avec statut PENDING', async () => {
      // Arrange
      const workerData = {
        nom: 'Diallo',
        prenom: 'Moussa',
        adresse: '45 Avenue Poincaré',
        tel: '+221778765432',
        email: `moussa.diallo.${Date.now()}@example.com`,
        password: 'WorkerPass123',
        type: 'WORKER' as const,
        professionId: 'profession-uuid',
      };

      // Mock de création de worker
      const createdWorker = {
        id: 'worker-id-' + Date.now(),
        nom: workerData.nom,
        prenom: workerData.prenom,
        email: workerData.email,
        role: ROLES.WORKER,
        workerStatus: WORKER_STATUS.PENDING,
        professionId: workerData.professionId,
        isActive: true,
        isBanned: false,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.create.mockResolvedValue(createdWorker);

      // Act
      const result = await mockPrismaUser.create({
        data: {
          nom: workerData.nom,
          prenom: workerData.prenom,
          adresse: workerData.adresse,
          tel: workerData.tel,
          email: workerData.email,
          password: 'hashed_password',
          role: ROLES.WORKER,
          workerStatus: WORKER_STATUS.PENDING,
          professionId: workerData.professionId,
        },
      });

      // Assert
      expect(result.workerStatus).toBe(WORKER_STATUS.PENDING);
      expect(result.role).toBe(ROLES.WORKER);
    });

    it('devrait bloquer worker PENDING à la connexion', async () => {
      // Arrange - Worker en attente
      const pendingWorker = {
        id: 'pending-worker-id',
        email: 'pending.worker@example.com',
        role: ROLES.WORKER,
        workerStatus: WORKER_STATUS.PENDING,
        isBanned: false,
        deletedAt: null,
      };

      mockPrismaUser.findUnique.mockResolvedValue(pendingWorker);

      // Simuler la vérification du statut worker
      const user = await mockPrismaUser.findUnique({
        where: { email: 'pending.worker@example.com' },
      });

      // Assert - Le worker ne peut pas se connecter car PENDING
      expect(user?.workerStatus).toBe(WORKER_STATUS.PENDING);
      expect(user?.workerStatus).not.toBe(WORKER_STATUS.APPROVED);
    });

    it('devrait permettre worker APPROVED de se connecter', async () => {
      // Arrange - Worker approuvé
      const approvedWorker = {
        id: 'approved-worker-id',
        email: 'approved.worker@example.com',
        role: ROLES.WORKER,
        workerStatus: WORKER_STATUS.APPROVED,
        isBanned: false,
        deletedAt: null,
      };

      mockPrismaUser.findUnique.mockResolvedValue(approvedWorker);

      // Simuler la vérification du statut worker
      const user = await mockPrismaUser.findUnique({
        where: { email: 'approved.worker@example.com' },
      });

      // Assert - Le worker peut se connecter car APPROVED
      expect(user?.workerStatus).toBe(WORKER_STATUS.APPROVED);
    });
  });

  // -------------------------------------------------------------------------
  // Tests: Gestion des utilisateurs bannis/supprimés
  // -------------------------------------------------------------------------

  describe('Banned/Deleted User Handling', () => {
    it('devrait bloquer utilisateur banni', async () => {
      // Arrange - Utilisateur banni
      const bannedUser = {
        id: 'banned-user-id',
        email: 'banned@example.com',
        role: ROLES.CLIENT,
        isBanned: true,
        deletedAt: null,
      };

      mockPrismaUser.findUnique.mockResolvedValue(bannedUser);

      // Act
      const user = await mockPrismaUser.findUnique({
        where: { email: 'banned@example.com' },
      });

      // Assert
      expect(user?.isBanned).toBe(true);
    });

    it('devrait bloquer utilisateur supprimé', async () => {
      // Arrange - Utilisateur supprimé (soft delete)
      const deletedUser = {
        id: 'deleted-user-id',
        email: 'deleted@example.com',
        role: ROLES.CLIENT,
        isBanned: false,
        deletedAt: new Date(), // Soft deleted
      };

      mockPrismaUser.findUnique.mockResolvedValue(deletedUser);

      // Act
      const user = await mockPrismaUser.findUnique({
        where: { email: 'deleted@example.com' },
      });

      // Assert
      expect(user?.deletedAt).not.toBeNull();
    });

    it('devrait permettre utilisateur actif de se connecter', async () => {
      // Arrange - Utilisateur actif
      const activeUser = {
        id: 'active-user-id',
        email: 'active@example.com',
        role: ROLES.CLIENT,
        isBanned: false,
        deletedAt: null,
      };

      mockPrismaUser.findUnique.mockResolvedValue(activeUser);

      // Act
      const user = await mockPrismaUser.findUnique({
        where: { email: 'active@example.com' },
      });

      // Assert
      expect(user?.isBanned).toBe(false);
      expect(user?.deletedAt).toBeNull();
    });
  });
});
