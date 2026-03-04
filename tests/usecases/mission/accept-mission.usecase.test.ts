// ============================================================================
// ACCEPT MISSION USE CASE TESTS
// ============================================================================
// Unit tests for AcceptMissionUseCase
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcceptMissionUseCase } from '../../../src/modules/mission/application/accept-mission.usecase.js';
import { createMockMissionRepository } from '../../mocks/repositories/mission.repository.js';
import { createMockNotificationService } from '../../mocks/services/notification.service.js';
import { MissionStatus } from '@prisma/client';

describe('AcceptMissionUseCase', () => {
  let acceptMissionUseCase: AcceptMissionUseCase;
  let mockMissionRepository: ReturnType<typeof createMockMissionRepository>;
  let mockNotificationService: ReturnType<typeof createMockNotificationService>;

  beforeEach(() => {
    mockMissionRepository = createMockMissionRepository();
    mockNotificationService = createMockNotificationService();
    // Use type casting for tests
    acceptMissionUseCase = new AcceptMissionUseCase(
      mockMissionRepository as any,
      mockNotificationService as any
    );
  });

  describe('execute', () => {
    // -------------------------------------------------------------------------
    // Tests: Happy Path
    // -------------------------------------------------------------------------

    it('should accept a mission successfully when status is PENDING_ACCEPT', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-1';

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: workerId,
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: null,
        montantRestant: null,
        status: MissionStatus.PENDING_ACCEPT,
        cancellationRequestedBy: null,
        clientConfirmed: false,
        workerConfirmed: false,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => true,
        acceptMission: () => ({
          ...mission,
          status: MissionStatus.CONTACT_UNLOCKED,
          updatedAt: new Date(),
        }),
        toResponse: () => ({
          id: missionId,
          clientId: 'client-1',
          workerId: workerId,
          status: MissionStatus.CONTACT_UNLOCKED,
        }),
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);
      mockMissionRepository.update = vi.fn().mockResolvedValue({
        ...mission,
        status: MissionStatus.CONTACT_UNLOCKED,
      });

      // Act
      const result = await acceptMissionUseCase.execute(missionId, workerId);

      // Assert
      expect(result.mission.status).toBe(MissionStatus.CONTACT_UNLOCKED);
      expect(mockMissionRepository.update).toHaveBeenCalled();
      expect(mockNotificationService.notifyMissionAccepted).toHaveBeenCalled();
    });

    it('should return mission and event on successful acceptance', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-1';

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: workerId,
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: null,
        montantRestant: null,
        status: MissionStatus.PENDING_ACCEPT,
        cancellationRequestedBy: null,
        clientConfirmed: false,
        workerConfirmed: false,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => true,
        acceptMission: () => ({
          ...mission,
          status: MissionStatus.CONTACT_UNLOCKED,
          updatedAt: new Date(),
        }),
        toResponse: () => ({
          id: missionId,
          clientId: 'client-1',
          workerId: workerId,
          status: MissionStatus.CONTACT_UNLOCKED,
        }),
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);
      mockMissionRepository.update = vi.fn().mockResolvedValue({
        ...mission,
        status: MissionStatus.CONTACT_UNLOCKED,
      });

      // Act
      const result = await acceptMissionUseCase.execute(missionId, workerId);

      // Assert
      expect(result).toHaveProperty('mission');
      expect(result).toHaveProperty('event');
      expect(result.event.type).toBe('MISSION_ACCEPTED');
    });

    // -------------------------------------------------------------------------
    // Tests: Error Cases
    // -------------------------------------------------------------------------

    it('should throw error when mission not found', async () => {
      // Arrange
      const missionId = 'non-existent-mission';
      const workerId = 'worker-1';

      mockMissionRepository.findById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(acceptMissionUseCase.execute(missionId, workerId)).rejects.toThrow(
        'Mission introuvable'
      );
    });

    it('should throw error when worker is not assigned to mission', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-2'; // Different worker

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: 'worker-1', // Different worker assigned
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: null,
        montantRestant: null,
        status: MissionStatus.PENDING_ACCEPT,
        cancellationRequestedBy: null,
        clientConfirmed: false,
        workerConfirmed: false,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => true,
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);

      // Act & Assert
      await expect(acceptMissionUseCase.execute(missionId, workerId)).rejects.toThrow(
        "Vous n'êtes pas assigné à cette mission"
      );
    });

    it('should throw error when mission status is not PENDING_ACCEPT', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-1';

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: workerId,
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: null,
        montantRestant: null,
        status: MissionStatus.PENDING_PAYMENT, // Wrong status
        cancellationRequestedBy: null,
        clientConfirmed: false,
        workerConfirmed: false,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => false, // Not pending accept
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);

      // Act & Assert
      await expect(acceptMissionUseCase.execute(missionId, workerId)).rejects.toThrow(
        "n'est pas en attente d'acceptation"
      );
    });

    it('should throw error when mission is cancelled', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-1';

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: workerId,
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: null,
        montantRestant: null,
        status: MissionStatus.CANCELLED, // Cancelled mission
        cancellationRequestedBy: null,
        clientConfirmed: false,
        workerConfirmed: false,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => false,
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);

      // Act & Assert
      await expect(acceptMissionUseCase.execute(missionId, workerId)).rejects.toThrow();
    });

    it('should throw error when mission is refused', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-1';

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: workerId,
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: null,
        montantRestant: null,
        status: MissionStatus.REFUSED, // Refused mission
        cancellationRequestedBy: null,
        clientConfirmed: false,
        workerConfirmed: false,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => false,
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);

      // Act & Assert
      await expect(acceptMissionUseCase.execute(missionId, workerId)).rejects.toThrow();
    });

    // -------------------------------------------------------------------------
    // Tests: Edge Cases
    // -------------------------------------------------------------------------

    it('should throw error when mission is completed', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-1';

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: workerId,
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: 7500,
        montantRestant: null,
        status: MissionStatus.COMPLETED, // Completed mission
        cancellationRequestedBy: null,
        clientConfirmed: true,
        workerConfirmed: true,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => false,
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);

      // Act & Assert
      await expect(acceptMissionUseCase.execute(missionId, workerId)).rejects.toThrow();
    });

    it('should send notification to client after acceptance', async () => {
      // Arrange
      const missionId = 'mission-1';
      const workerId = 'worker-1';

      const mission = {
        id: missionId,
        clientId: 'client-1',
        workerId: workerId,
        serviceId: 'service-1',
        titre: 'Test Mission',
        description: 'Test Description',
        prixMin: 5000,
        prixMax: 10000,
        prixFinal: null,
        montantRestant: null,
        status: MissionStatus.PENDING_ACCEPT,
        cancellationRequestedBy: null,
        clientConfirmed: false,
        workerConfirmed: false,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPendingAccept: () => true,
        acceptMission: () => ({
          ...mission,
          status: MissionStatus.CONTACT_UNLOCKED,
          updatedAt: new Date(),
        }),
        toResponse: () => ({
          id: missionId,
          clientId: 'client-1',
          workerId: workerId,
          status: MissionStatus.CONTACT_UNLOCKED,
        }),
      };

      mockMissionRepository.findById = vi.fn().mockResolvedValue(mission);
      mockMissionRepository.update = vi.fn().mockResolvedValue({
        ...mission,
        status: MissionStatus.CONTACT_UNLOCKED,
      });

      // Act
      await acceptMissionUseCase.execute(missionId, workerId);

      // Assert
      expect(mockNotificationService.notifyMissionAccepted).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId,
          clientId: 'client-1',
          workerId,
        })
      );
    });
  });
});
