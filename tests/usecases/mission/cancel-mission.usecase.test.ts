// ============================================================================
// CANCEL MISSION USE CASE TESTS
// ============================================================================
// Tests pour le use case d'annulation de mission
// Inclut les scénarios: client annule, worker annule
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CancelMissionUseCase } from '../../../src/modules/mission/application/cancel-mission.usecase.js';
import { MissionStatus } from '../../../src/modules/mission/domain/index.js';
import { createMockMissionRepository } from '../../__mocks__/repositories.js';
import { createMockNotificationService } from '../../mocks/services/notification.service.js';
import type { IMissionRepository } from '../../../src/modules/mission/application/mission.repository.interface.js';
import { generateTestId, createTestMission } from '../../setup.js';

describe('CancelMissionUseCase', () => {
  let missionRepository: IMissionRepository;
  let notificationService: ReturnType<typeof createMockNotificationService>;
  let cancelMissionUseCase: CancelMissionUseCase;

  beforeEach(() => {
    missionRepository = createMockMissionRepository();
    notificationService = createMockNotificationService();
    cancelMissionUseCase = new CancelMissionUseCase(missionRepository, notificationService as any);
  });

  describe('execute()', () => {
    it('should cancel mission in PENDING_PAYMENT status', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.PENDING_PAYMENT 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'update').mockResolvedValue({
        ...mission,
        status: MissionStatus.CANCELLED,
      } as any);

      // Act - Le userId doit être le clientId ou workerId de la mission
      await cancelMissionUseCase.execute(mission.id, mission.clientId);

      // Assert
      expect(missionRepository.update).toHaveBeenCalled();
    });

    it('should cancel mission in PENDING_ACCEPT status', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.PENDING_ACCEPT 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'update').mockResolvedValue({
        ...mission,
        status: MissionStatus.CANCELLED,
      } as any);

      // Act
      await cancelMissionUseCase.execute(mission.id, mission.clientId);

      // Assert
      expect(missionRepository.update).toHaveBeenCalled();
    });

    it('should cancel mission in CONTACT_UNLOCKED status', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.CONTACT_UNLOCKED 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'update').mockResolvedValue({
        ...mission,
        status: MissionStatus.CANCELLED,
      } as any);

      // Act
      await cancelMissionUseCase.execute(mission.id, mission.clientId);

      // Assert
      expect(missionRepository.update).toHaveBeenCalled();
    });

    it('should cancel mission in NEGOTIATION_DONE status', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.NEGOTIATION_DONE 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'update').mockResolvedValue({
        ...mission,
        status: MissionStatus.CANCELLED,
      } as any);

      // Act
      await cancelMissionUseCase.execute(mission.id, mission.clientId);

      // Assert
      expect(missionRepository.update).toHaveBeenCalled();
    });

    it('should cancel mission in AWAITING_FINAL_PAYMENT status', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.AWAITING_FINAL_PAYMENT 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'update').mockResolvedValue({
        ...mission,
        status: MissionStatus.CANCELLED,
      } as any);

      // Act
      await cancelMissionUseCase.execute(mission.id, mission.clientId);

      // Assert
      expect(missionRepository.update).toHaveBeenCalled();
    });

    it('should allow worker to cancel mission', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.PENDING_PAYMENT 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'update').mockResolvedValue({
        ...mission,
        status: MissionStatus.CANCELLED,
      } as any);

      // Act - Worker peut aussi annuler
      await cancelMissionUseCase.execute(mission.id, mission.workerId);

      // Assert
      expect(missionRepository.update).toHaveBeenCalled();
    });
  });

  describe('execute() - Error Cases', () => {
    it('should throw error if mission not found', async () => {
      // Arrange
      vi.spyOn(missionRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(cancelMissionUseCase.execute('nonexistent-id', generateTestId('user'))).rejects.toThrow(
        'Mission introuvable'
      );
    });

    it('should throw error if user is not the client or worker', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.PENDING_PAYMENT 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert - Un utilisateur tiers ne peut pas annuler
      await expect(cancelMissionUseCase.execute(mission.id, 'unauthorized-user-id')).rejects.toThrow(
        "Vous n'êtes pas autorisé à annuler cette mission"
      );
    });

    it('should throw error if mission is COMPLETED', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.COMPLETED 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(cancelMissionUseCase.execute(mission.id, mission.clientId)).rejects.toThrow(
        'La mission ne peut pas être annulée'
      );
    });

    it('should throw error if mission is already CANCELLED', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.CANCELLED 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(cancelMissionUseCase.execute(mission.id, mission.clientId)).rejects.toThrow(
        'La mission ne peut pas être annulée'
      );
    });

    it('should throw error if mission is REFUSED', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.REFUSED 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(cancelMissionUseCase.execute(mission.id, mission.clientId)).rejects.toThrow(
        'La mission ne peut pas être annulée'
      );
    });

    it('should throw error if mission is IN_PROGRESS (use requestCancellation)', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.IN_PROGRESS 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(cancelMissionUseCase.execute(mission.id, mission.clientId)).rejects.toThrow(
        'La mission ne peut pas être annulée'
      );
    });

    it('should throw error if mission is CANCEL_REQUESTED (use processCancellation)', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.CANCEL_REQUESTED 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(cancelMissionUseCase.execute(mission.id, mission.clientId)).rejects.toThrow(
        'La mission ne peut pas être annulée'
      );
    });

    it('should throw error if missionId is empty', async () => {
      // Act & Assert
      await expect(cancelMissionUseCase.execute('', generateTestId('user'))).rejects.toThrow(
        "L'ID de la mission est requis"
      );
    });

    it('should throw error if userId is empty', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.PENDING_PAYMENT 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(cancelMissionUseCase.execute(mission.id, '')).rejects.toThrow(
        "L'ID de l'utilisateur est requis"
      );
    });
  });
});
