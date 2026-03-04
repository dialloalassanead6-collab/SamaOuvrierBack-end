// ============================================================================
// REGISTER USE CASE TESTS
// ============================================================================
// Tests unitaires pour le use case d'inscription
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase, EmailAlreadyExistsError, ProfessionNotFoundError, NoProfessionAvailableError, AdminRegistrationForbiddenError } from '../../../src/modules/auth/application/register.usecase.js';
import { createMockAuthRepository } from '../../__mocks__/auth.repository.js';
import { createMockPasswordService } from '../../__mocks__/password.service.js';
import { Role } from '@prisma/client';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockAuthRepository: ReturnType<typeof createMockAuthRepository>;
  let mockPasswordService: ReturnType<typeof createMockPasswordService>;

  beforeEach(() => {
    mockAuthRepository = createMockAuthRepository();
    mockPasswordService = createMockPasswordService();
    registerUseCase = new RegisterUseCase(mockAuthRepository, mockPasswordService);
  });

  describe('executeClient', () => {
    // -------------------------------------------------------------------------
    // Tests: Inscription client réussie
    // -------------------------------------------------------------------------

    it('devrait inscription un client avec succès', async () => {
      // Arrange
      const clientInput = {
        type: 'CLIENT' as const,
        nom: 'Doe',
        prenom: 'John',
        adresse: '123 Test Street',
        tel: '+221771234567',
        email: 'newclient@test.com',
        password: 'password123',
      };

      mockAuthRepository.existsByEmail = vi.fn().mockResolvedValue(false);
      mockPasswordService.hash = vi.fn().mockResolvedValue('hashed_password');
      mockAuthRepository.createUser = vi.fn().mockImplementation(async (data) => ({
        id: 'new-user-id',
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        tel: data.tel,
        email: data.email,
        role: data.role,
        workerStatus: null,
        professionId: null,
        createdAt: new Date(),
      }));

      // Act
      const result = await registerUseCase.executeClient(clientInput);

      // Assert
      expect(result.user).toHaveProperty('email', 'newclient@test.com');
      expect(result.user.role).toBe(Role.CLIENT);
      expect(mockPasswordService.hash).toHaveBeenCalledWith('password123');
    });

    it('devrait rejeter si email déjà utilisé', async () => {
      // Arrange
      const clientInput = {
        type: 'CLIENT' as const,
        nom: 'Doe',
        prenom: 'John',
        adresse: '123 Test Street',
        tel: '+221771234567',
        email: 'existing@test.com',
        password: 'password123',
      };

      mockAuthRepository.existsByEmail = vi.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(
        registerUseCase.executeClient(clientInput)
      ).rejects.toThrow(EmailAlreadyExistsError);
    });
  });

  describe('executeWorker', () => {
    // -------------------------------------------------------------------------
    // Tests: Inscription worker réussie
    // -------------------------------------------------------------------------

    it('devrait inscription un worker avec succès', async () => {
      // Arrange
      const professionId = 'profession-uuid-1234';
      const workerInput = {
        type: 'WORKER' as const,
        nom: 'Doe',
        prenom: 'Jane',
        adresse: '456 Worker Street',
        tel: '+221778765432',
        email: 'newworker@test.com',
        password: 'password123',
        professionId,
      };

      mockAuthRepository.hasAnyProfession = vi.fn().mockResolvedValue(true);
      mockAuthRepository.findProfessionById = vi.fn().mockResolvedValue({
        id: professionId,
        name: 'Plombier',
        description: 'Professional plumber',
      });
      mockAuthRepository.existsByEmail = vi.fn().mockResolvedValue(false);
      mockPasswordService.hash = vi.fn().mockResolvedValue('hashed_password');
      mockAuthRepository.createUser = vi.fn().mockImplementation(async (data) => ({
        id: 'new-worker-id',
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        tel: data.tel,
        email: data.email,
        role: data.role,
        workerStatus: data.workerStatus,
        professionId: data.professionId,
        createdAt: new Date(),
      }));

      // Act
      const result = await registerUseCase.executeWorker(workerInput);

      // Assert
      expect(result.user).toHaveProperty('email', 'newworker@test.com');
      expect(result.user.role).toBe(Role.WORKER);
      expect(result.user.workerStatus).toBe('PENDING'); // Worker starts as PENDING
    });

    it('devrait rejeter si aucune profession disponible', async () => {
      // Arrange
      const workerInput = {
        type: 'WORKER' as const,
        nom: 'Doe',
        prenom: 'Jane',
        adresse: '456 Worker Street',
        tel: '+221778765432',
        email: 'newworker@test.com',
        password: 'password123',
        professionId: 'profession-uuid-1234',
      };

      mockAuthRepository.hasAnyProfession = vi.fn().mockResolvedValue(false);

      // Act & Assert
      await expect(
        registerUseCase.executeWorker(workerInput)
      ).rejects.toThrow(NoProfessionAvailableError);
    });

    it('devrait rejeter si profession inexistante', async () => {
      // Arrange
      const workerInput = {
        type: 'WORKER' as const,
        nom: 'Doe',
        prenom: 'Jane',
        adresse: '456 Worker Street',
        tel: '+221778765432',
        email: 'newworker@test.com',
        password: 'password123',
        professionId: 'invalid-profession-id',
      };

      mockAuthRepository.hasAnyProfession = vi.fn().mockResolvedValue(true);
      mockAuthRepository.findProfessionById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        registerUseCase.executeWorker(workerInput)
      ).rejects.toThrow(ProfessionNotFoundError);
    });

    it('devrait rejeter si email déjà utilisé (worker)', async () => {
      // Arrange
      const professionId = 'profession-uuid-1234';
      const workerInput = {
        type: 'WORKER' as const,
        nom: 'Doe',
        prenom: 'Jane',
        adresse: '456 Worker Street',
        tel: '+221778765432',
        email: 'existing@test.com',
        password: 'password123',
        professionId,
      };

      mockAuthRepository.hasAnyProfession = vi.fn().mockResolvedValue(true);
      mockAuthRepository.findProfessionById = vi.fn().mockResolvedValue({
        id: professionId,
        name: 'Plombier',
        description: 'Professional plumber',
      });
      mockAuthRepository.existsByEmail = vi.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(
        registerUseCase.executeWorker(workerInput)
      ).rejects.toThrow(EmailAlreadyExistsError);
    });
  });

  describe('execute', () => {
    // -------------------------------------------------------------------------
    // Tests: Inscription avec type dynamique
    // -------------------------------------------------------------------------

    it('devrait exécuter inscription client quand type=CLIENT', async () => {
      // Arrange
      const clientInput = {
        type: 'CLIENT' as const,
        nom: 'Doe',
        prenom: 'John',
        adresse: '123 Test Street',
        tel: '+221771234567',
        email: 'client@test.com',
        password: 'password123',
      };

      mockAuthRepository.existsByEmail = vi.fn().mockResolvedValue(false);
      mockPasswordService.hash = vi.fn().mockResolvedValue('hashed_password');
      mockAuthRepository.createUser = vi.fn().mockImplementation(async (data) => ({
        id: 'user-id',
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        tel: data.tel,
        email: data.email,
        role: data.role,
        workerStatus: null,
        professionId: null,
        createdAt: new Date(),
      }));

      // Act
      const result = await registerUseCase.execute(clientInput);

      // Assert
      expect(result.user.role).toBe(Role.CLIENT);
    });

    it('devrait exécuter inscription worker quand type=WORKER', async () => {
      // Arrange
      const professionId = 'profession-uuid-1234';
      const workerInput = {
        type: 'WORKER' as const,
        nom: 'Doe',
        prenom: 'Jane',
        adresse: '456 Worker Street',
        tel: '+221778765432',
        email: 'worker@test.com',
        password: 'password123',
        professionId,
      };

      mockAuthRepository.hasAnyProfession = vi.fn().mockResolvedValue(true);
      mockAuthRepository.findProfessionById = vi.fn().mockResolvedValue({
        id: professionId,
        name: 'Plombier',
        description: 'Professional plumber',
      });
      mockAuthRepository.existsByEmail = vi.fn().mockResolvedValue(false);
      mockPasswordService.hash = vi.fn().mockResolvedValue('hashed_password');
      mockAuthRepository.createUser = vi.fn().mockImplementation(async (data) => ({
        id: 'worker-id',
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        tel: data.tel,
        email: data.email,
        role: data.role,
        workerStatus: data.workerStatus,
        professionId: data.professionId,
        createdAt: new Date(),
      }));

      // Act
      const result = await registerUseCase.execute(workerInput);

      // Assert
      expect(result.user.role).toBe(Role.WORKER);
    });

    it('devrait rejeter inscription admin', async () => {
      // Arrange - Simulation d'une tentative d'inscription admin (ne devrait pas être possible via l'API)
      const adminInput = {
        type: 'ADMIN' as any,
        nom: 'Admin',
        prenom: 'Super',
        adresse: 'Admin Street',
        tel: '+221779999999',
        email: 'admin@test.com',
        password: 'password123',
      };

      // Act & Assert
      await expect(
        registerUseCase.execute(adminInput)
      ).rejects.toThrow(AdminRegistrationForbiddenError);
    });
  });
});
