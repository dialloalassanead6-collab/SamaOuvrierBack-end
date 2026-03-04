// ============================================================================
// CREATE MISSION USE CASE TESTS
// ============================================================================
// Tests pour le use case de création de mission
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateMissionUseCase } from '../../../src/modules/mission/application/create-mission.usecase.js';
import { MissionStatus } from '../../../src/modules/mission/domain/index.js';
import { Service } from '../../../src/modules/service/domain/service.entity.js';
import { createMockMissionRepository, createMockServiceRepository } from '../../__mocks__/repositories.js';
import type { IMissionRepository } from '../../../src/modules/mission/application/mission.repository.interface.js';
import type { IServiceRepository } from '../../../src/modules/service/application/service.repository.interface.js';
import { generateTestId } from '../../setup.js';

describe('CreateMissionUseCase', () => {
  let missionRepository: IMissionRepository;
  let serviceRepository: IServiceRepository;
  let createMissionUseCase: CreateMissionUseCase;

  // Create a real Service entity for tests
  const workerId = generateTestId('worker');
  const mockService = new Service({
    id: generateTestId('service'),
    title: 'Plomberie',
    description: 'Services de plomberie complète pour tous vos besoins',
    minPrice: 5000,
    maxPrice: 20000,
    workerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    missionRepository = createMockMissionRepository();
    serviceRepository = createMockServiceRepository();
    createMissionUseCase = new CreateMissionUseCase(missionRepository, serviceRepository);
  });

  describe('execute()', () => {
    it('should create a mission with valid input', async () => {
      // Arrange
      const clientId = generateTestId('client');

      vi.spyOn(serviceRepository, 'findById').mockResolvedValue(mockService);

      // Act
      const result = await createMissionUseCase.execute(
        { workerId, serviceId: mockService.id },
        clientId
      );

      // Assert
      expect(result.clientId).toBe(clientId);
      expect(result.workerId).toBe(workerId);
      expect(result.serviceId).toBe(mockService.id);
      expect(result.status).toBe(MissionStatus.PENDING_PAYMENT);
      expect(result.prixMin).toBe(mockService.minPrice);
      expect(result.prixMax).toBe(mockService.maxPrice);
    });

    it('should throw error if service not found', async () => {
      // Arrange
      const clientId = generateTestId('client');

      vi.spyOn(serviceRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(
        createMissionUseCase.execute({ workerId, serviceId: 'nonexistent-service' }, clientId)
      ).rejects.toThrow('Service introuvable');
    });

    it('should throw error if service does not belong to worker', async () => {
      // Arrange
      const clientId = generateTestId('client');
      const differentWorkerId = generateTestId('worker-other');

      vi.spyOn(serviceRepository, 'findById').mockResolvedValue(mockService);

      // Act & Assert
      await expect(
        createMissionUseCase.execute({ workerId: differentWorkerId, serviceId: mockService.id }, clientId)
      ).rejects.toThrow("Le service sélectionné n'appartient pas au worker spécifié");
    });

    it('should throw error if client is the same as worker', async () => {
      // Arrange - clientId is same as workerId
      vi.spyOn(serviceRepository, 'findById').mockResolvedValue(mockService);

      // Act & Assert
      await expect(
        createMissionUseCase.execute({ workerId, serviceId: mockService.id }, workerId)
      ).rejects.toThrow('Le client et le worker ne peuvent pas être la même personne');
    });

    it('should throw error if workerId is empty', async () => {
      // Arrange
      const clientId = generateTestId('client');

      // Act & Assert
      await expect(
        createMissionUseCase.execute({ workerId: '', serviceId: 'service-1' }, clientId)
      ).rejects.toThrow("L'ID du worker est requis");
    });

    it('should throw error if serviceId is empty', async () => {
      // Arrange
      const clientId = generateTestId('client');

      // Act & Assert
      await expect(
        createMissionUseCase.execute({ workerId: 'worker-1', serviceId: '' }, clientId)
      ).rejects.toThrow("L'ID du service est requis");
    });

    it('should use clientId from authenticated user', async () => {
      // Arrange
      const authenticatedUserId = generateTestId('client-auth');

      vi.spyOn(serviceRepository, 'findById').mockResolvedValue(mockService);

      // Act
      const result = await createMissionUseCase.execute(
        { workerId, serviceId: mockService.id },
        authenticatedUserId
      );

      // Assert
      expect(result.clientId).toBe(authenticatedUserId);
    });

    it('should copy prixMin and prixMax from service', async () => {
      // Arrange
      const clientId = generateTestId('client');

      vi.spyOn(serviceRepository, 'findById').mockResolvedValue(mockService);

      // Act
      const result = await createMissionUseCase.execute(
        { workerId, serviceId: mockService.id },
        clientId
      );

      // Assert
      expect(result.prixMin).toBe(mockService.minPrice);
      expect(result.prixMax).toBe(mockService.maxPrice);
    });
  });
});
