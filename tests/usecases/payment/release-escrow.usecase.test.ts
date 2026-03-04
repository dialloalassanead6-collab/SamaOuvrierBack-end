// ============================================================================
// RELEASE ESCROW USE CASE TESTS
// ============================================================================
// Tests pour le use case de libération d'escrow après completion
// Vérifie la double confirmation et le calcul de commission 10%
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReleaseEscrowUseCase, type ReleaseEscrowInput } from '../../../src/modules/payment/application/use-cases/ReleaseEscrowUseCase.js';
import { EscrowDomainService } from '../../../src/modules/payment/domain/index.js';
import { createMockPaymentRepository, createMockMissionRepositoryForPayment } from '../../__mocks__/repositories.js';
import { createMockPayTechService } from '../../__mocks__/paytech.service.js';
import type { IPaymentRepository } from '../../../src/modules/payment/application/payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../../../src/modules/payment/application/mission-repository.interface.js';
import type { PayTechService } from '../../../src/modules/payment/infrastructure/paytech/PayTechService.js';
import { EscrowStatus, PaymentStatus } from '../../../src/modules/payment/domain/index.js';
import { MissionStatus } from '../../../src/modules/mission/domain/index.js';
import { generateTestId, createTestMission, createTestEscrow, createTestPayment } from '../../setup.js';

describe('ReleaseEscrowUseCase', () => {
  let paymentRepository: IPaymentRepository;
  let missionRepository: IMissionRepositoryForPayment;
  let paytechService: PayTechService;
  let escrowDomainService: EscrowDomainService;
  let releaseEscrowUseCase: ReleaseEscrowUseCase;

  const commissionPercent = 10;
  const currency = 'XOF';

  beforeEach(() => {
    paymentRepository = createMockPaymentRepository();
    missionRepository = createMockMissionRepositoryForPayment();
    paytechService = createMockPayTechService() as unknown as PayTechService;
    escrowDomainService = new EscrowDomainService({ commissionPercent, currency });
    releaseEscrowUseCase = new ReleaseEscrowUseCase(
      paymentRepository,
      missionRepository,
      paytechService,
      escrowDomainService
    );
  });

  const createInProgressMission = (overrides: Record<string, unknown> = {}) =>
    createTestMission({
      status: MissionStatus.IN_PROGRESS,
      clientConfirmed: false,
      workerConfirmed: false,
      ...overrides,
    });

  const createHeldEscrow = (missionId: string, amount: number = 5000) =>
    createTestEscrow({
      missionId,
      amount,
      workerAmount: amount * 0.9, // 90% after 10% commission
      commissionAmount: amount * 0.1, // 10% commission
      status: EscrowStatus.HELD,
    });

  describe('execute() - Double Confirmation', () => {
    it('should record client confirmation when client confirms first', async () => {
      // Arrange
      const mission = createInProgressMission();
      const escrow = createHeldEscrow(mission.id);
      const payment = createTestPayment({ missionId: mission.id, status: PaymentStatus.SUCCESS });

      const input: ReleaseEscrowInput = {
        missionId: mission.id,
        userId: mission.clientId,
        role: 'CLIENT',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'markClientConfirmed').mockResolvedValue({
        ...mission,
        clientConfirmed: true,
      } as any);
      vi.spyOn(paymentRepository, 'findEscrowByMissionId').mockResolvedValue(escrow as any);

      // Act
      const result = await releaseEscrowUseCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Confirmation enregistrée');
      expect(result.missionStatus).toBe(MissionStatus.IN_PROGRESS);
    });

    it('should release escrow when both client and worker confirm', async () => {
      // Arrange
      const mission = createInProgressMission({
        clientConfirmed: true, // Client already confirmed
      });
      const escrow = createHeldEscrow(mission.id);
      const payment = createTestPayment({ missionId: mission.id, status: PaymentStatus.SUCCESS });

      const input: ReleaseEscrowInput = {
        missionId: mission.id,
        userId: mission.workerId,
        role: 'WORKER',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'markWorkerConfirmed').mockResolvedValue({
        ...mission,
        clientConfirmed: true,
        workerConfirmed: true,
      } as any);
      vi.spyOn(missionRepository, 'hasBothConfirmed').mockResolvedValue(true);
      vi.spyOn(paymentRepository, 'findEscrowByMissionId').mockResolvedValue(escrow as any);
      vi.spyOn(paymentRepository, 'findPaymentByMissionId').mockResolvedValue(payment as any);

      // Act
      const result = await releaseEscrowUseCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.missionStatus).toBe(MissionStatus.COMPLETED);
      expect(result.workerAmount).toBeGreaterThan(0);
      expect(result.commissionAmount).toBeGreaterThan(0);
      expect(result.message).toContain('libérés');
    });
  });

  describe('execute() - Error Cases', () => {
    it('should throw error if mission not found', async () => {
      // Arrange
      const input: ReleaseEscrowInput = {
        missionId: 'nonexistent-mission',
        userId: generateTestId('user'),
        role: 'CLIENT',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(releaseEscrowUseCase.execute(input)).rejects.toThrow('Mission introuvable');
    });

    it('should throw error if mission is not IN_PROGRESS', async () => {
      // Arrange
      const mission = createTestMission({ status: MissionStatus.PENDING_PAYMENT });
      
      const input: ReleaseEscrowInput = {
        missionId: mission.id,
        userId: mission.clientId,
        role: 'CLIENT',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(releaseEscrowUseCase.execute(input)).rejects.toThrow(
        "La mission n'est pas en cours"
      );
    });

    it('should throw error if user is not the client', async () => {
      // Arrange
      const mission = createInProgressMission();
      
      const input: ReleaseEscrowInput = {
        missionId: mission.id,
        userId: 'wrong-user-id',
        role: 'CLIENT',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(releaseEscrowUseCase.execute(input)).rejects.toThrow(
        "Vous n'êtes pas le client de cette mission"
      );
    });

    it('should throw error if escrow not found', async () => {
      // Arrange
      const mission = createInProgressMission();
      
      const input: ReleaseEscrowInput = {
        missionId: mission.id,
        userId: mission.clientId,
        role: 'CLIENT',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(paymentRepository, 'findEscrowByMissionId').mockResolvedValue(null);

      // Act & Assert
      await expect(releaseEscrowUseCase.execute(input)).rejects.toThrow(
        'Escrow introuvable pour cette mission'
      );
    });

    it('should throw error if escrow is not HELD', async () => {
      // Arrange
      const mission = createInProgressMission();
      const escrow = createTestEscrow({ 
        missionId: mission.id, 
        status: EscrowStatus.RELEASED 
      });
      
      const input: ReleaseEscrowInput = {
        missionId: mission.id,
        userId: mission.clientId,
        role: 'CLIENT',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(paymentRepository, 'findEscrowByMissionId').mockResolvedValue(escrow as any);

      // Act & Assert
      await expect(releaseEscrowUseCase.execute(input)).rejects.toThrow(
        "L'escrow n'est pas en attente de libération"
      );
    });
  });

  describe('Commission Calculation', () => {
    it('should calculate correct commission (10%) on release', async () => {
      // Arrange
      const mission = createInProgressMission({ clientConfirmed: true });
      const amount = 10000;
      const escrow = createHeldEscrow(mission.id, amount);
      const payment = createTestPayment({ missionId: mission.id, status: PaymentStatus.SUCCESS });

      const input: ReleaseEscrowInput = {
        missionId: mission.id,
        userId: mission.workerId,
        role: 'WORKER',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(missionRepository, 'markWorkerConfirmed').mockResolvedValue({
        ...mission,
        clientConfirmed: true,
        workerConfirmed: true,
      } as any);
      vi.spyOn(missionRepository, 'hasBothConfirmed').mockResolvedValue(true);
      vi.spyOn(paymentRepository, 'findEscrowByMissionId').mockResolvedValue(escrow as any);
      vi.spyOn(paymentRepository, 'findPaymentByMissionId').mockResolvedValue(payment as any);

      // Act
      const result = await releaseEscrowUseCase.execute(input);

      // Assert - 10% commission
      expect(result.commissionAmount).toBe(amount * 0.1); // 1000
      expect(result.workerAmount).toBe(amount * 0.9); // 9000
    });
  });
});
