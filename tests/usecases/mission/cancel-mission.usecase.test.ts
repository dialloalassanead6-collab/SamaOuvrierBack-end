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
import type { IMissionRepository } from '../../../src/modules/mission/application/mission.repository.interface.js';
import { generateTestId, createTestMission } from '../../setup.js';

describe('CancelMissionUseCase', () => {
  let missionRepository: IMissionRepository;
  let cancelMissionUseCase: CancelMissionUseCase;

  beforeEach(() => {
    missionRepository = createMockMissionRepository();
    cancelMissionUseCase = new CancelMissionUseCase(missionRepository);
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

      // Act
      await cancelMissionUseCase.execute(mission.id);

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
      await cancelMissionUseCase.execute(mission.id);

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
      await cancelMissionUseCase.execute(mission.id);

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
      await cancelMissionUseCase.execute(mission.id);

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
      await cancelMissionUseCase.execute(mission.id);

      // Assert
      expect(missionRepository.update).toHaveBeenCalled();
    });
  });

  describe('execute() - Error Cases', () => {
    it('should throw error if mission not found', async () => {
      // Arrange
      vi.spyOn(missionRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(cancelMissionUseCase.execute('nonexistent-id')).rejects.toThrow(
        'Mission introuvable'
      );
    });

    it('should throw error if mission is COMPLETED', async () => {
      // Arrange
      const mission = createTestMission({ 
        status: MissionStatus.COMPLETED 
      });

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(cancelMissionUseCase.execute(mission.id)).rejects.toThrow(
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
      await expect(cancelMissionUseCase.execute(mission.id)).rejects.toThrow(
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
      await expect(cancelMissionUseCase.execute(mission.id)).rejects.toThrow(
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
      await expect(cancelMissionUseCase.execute(mission.id)).rejects.toThrow(
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
      await expect(cancelMissionUseCase.execute(mission.id)).rejects.toThrow(
        'La mission ne peut pas être annulée'
      );
    });

    it('should throw error if missionId is empty', async () => {
      // Act & Assert
      await expect(cancelMissionUseCase.execute('')).rejects.toThrow(
        "L'ID de la mission est requis"
      );
    });
  });
});
