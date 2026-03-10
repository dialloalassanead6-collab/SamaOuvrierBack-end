// ============================================================================
// LOGIN USE CASE TESTS
// ============================================================================
// Tests unitaires pour le use case de connexion
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase, InvalidCredentialsError, WorkerNotApprovedError, WorkerRejectedError, UserBannedLoginError, UserDeletedLoginError } from '../../../src/modules/auth/application/login.usecase.js';
import { createMockAuthRepository, createTestClient, createTestWorkerApproved, createTestWorkerPending, createTestWorkerRejected, createTestBannedUser, createTestDeletedUser } from '../../__mocks__/auth.repository.js';
import { createMockPasswordService, createLenientMockPasswordService, createStrictMockPasswordService } from '../../__mocks__/password.service.js';
import { Role, WorkerStatus } from '../../__mocks__/prisma-client.js';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockAuthRepository: ReturnType<typeof createMockAuthRepository>;
  let mockPasswordService: ReturnType<typeof createMockPasswordService>;

  beforeEach(() => {
    mockAuthRepository = createMockAuthRepository();
    mockPasswordService = createMockPasswordService();
    loginUseCase = new LoginUseCase(mockAuthRepository, mockPasswordService);
  });

  describe('execute', () => {
    // -------------------------------------------------------------------------
    // Tests: Connexion réussie
    // -------------------------------------------------------------------------

    it('devrait connecter un client avec succès', async () => {
      // Arrange
      const client = createTestClient('client@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(client);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute('client@test.com', 'validPassword');

      // Assert
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', 'client@test.com');
      expect(result.user.role).toBe(Role.CLIENT);
    });

    it('devrait connecter un worker approved avec succès', async () => {
      // Arrange
      const worker = createTestWorkerApproved('worker@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(worker);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute('worker@test.com', 'validPassword');

      // Assert
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', 'worker@test.com');
      expect(result.user.role).toBe(Role.WORKER);
      expect(result.user.workerStatus).toBe(WorkerStatus.APPROVED);
    });

    // -------------------------------------------------------------------------
    // Tests: Erreurs d'identifiants
    // -------------------------------------------------------------------------

    it('devrait échouer si email inexistant', async () => {
      // Arrange
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        loginUseCase.execute('nonexistent@test.com', 'password')
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('devrait échouer si mot de passe incorrect', async () => {
      // Arrange
      const client = createTestClient('client@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(client);
      mockPasswordService.compare = vi.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(
        loginUseCase.execute('client@test.com', 'wrongPassword')
      ).rejects.toThrow(InvalidCredentialsError);
    });

    // -------------------------------------------------------------------------
    // Tests: Erreurs de statut worker
    // -------------------------------------------------------------------------

    it('devrait échouer si worker en attente de validation', async () => {
      // Arrange
      const workerPending = createTestWorkerPending('worker-pending@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(workerPending);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(
        loginUseCase.execute('worker-pending@test.com', 'validPassword')
      ).rejects.toThrow(WorkerNotApprovedError);
    });

    it('devrait échouer si worker rejeté', async () => {
      // Arrange
      const workerRejected = createTestWorkerRejected('worker-rejected@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(workerRejected);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(
        loginUseCase.execute('worker-rejected@test.com', 'validPassword')
      ).rejects.toThrow(WorkerRejectedError);
    });

    // -------------------------------------------------------------------------
    // Tests: Erreurs de statut utilisateur
    // -------------------------------------------------------------------------

    it('devrait échouer si utilisateur banni', async () => {
      // Arrange
      const bannedUser = createTestBannedUser('banned@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(bannedUser);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(
        loginUseCase.execute('banned@test.com', 'validPassword')
      ).rejects.toThrow(UserBannedLoginError);
    });

    it('devrait échouer si utilisateur supprimé', async () => {
      // Arrange
      const deletedUser = createTestDeletedUser('deleted@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(deletedUser);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(
        loginUseCase.execute('deleted@test.com', 'validPassword')
      ).rejects.toThrow(UserDeletedLoginError);
    });

    // -------------------------------------------------------------------------
    // Tests: Vérification du token JWT
    // -------------------------------------------------------------------------

    it('devrait générer un token JWT valide', async () => {
      // Arrange
      const client = createTestClient('client@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(client);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute('client@test.com', 'validPassword');

      // Assert
      expect(result.token).toBeTruthy();
      expect(result.token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    // -------------------------------------------------------------------------
    // Tests: Vérification que le mot de passe n est pas exposé
    // -------------------------------------------------------------------------

    it('devrait ne pas exposer le mot de passe dans la réponse', async () => {
      // Arrange
      const client = createTestClient('client@test.com');
      mockAuthRepository.findByEmailWithPassword = vi.fn().mockResolvedValue(client);
      mockPasswordService.compare = vi.fn().mockResolvedValue(true);

      // Act
      const result = await loginUseCase.execute('client@test.com', 'validPassword');

      // Assert
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
