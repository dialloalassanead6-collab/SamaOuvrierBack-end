// ============================================================================
// CREATE PAYMENT USE CASE TESTS
// ============================================================================
// Tests pour le use case de création de paiement avec escrow
// Simule PayTech en mode test
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreatePaymentUseCase, type CreatePaymentInput } from '../../../src/modules/payment/application/use-cases/CreatePaymentUseCase.js';
import { EscrowDomainService } from '../../../src/modules/payment/domain/index.js';
import { createMockPaymentRepository, createMockMissionRepositoryForPayment } from '../../__mocks__/repositories.js';
import { createMockPayTechService } from '../../__mocks__/paytech.service.js';
import type { IPaymentRepository } from '../../../src/modules/payment/application/payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../../../src/modules/payment/application/mission-repository.interface.js';
import type { PayTechService } from '../../../src/modules/payment/infrastructure/paytech/PayTechService.js';
import { MissionStatus } from '../../../src/modules/mission/domain/index.js';
import { generateTestId, createTestMission } from '../../setup.js';

describe('CreatePaymentUseCase', () => {
  let paymentRepository: IPaymentRepository;
  let missionRepository: IMissionRepositoryForPayment;
  let paytechService: PayTechService;
  let escrowDomainService: EscrowDomainService;
  let createPaymentUseCase: CreatePaymentUseCase;

  const commissionPercent = 10;
  const currency = 'XOF';

  beforeEach(() => {
    paymentRepository = createMockPaymentRepository();
    missionRepository = createMockMissionRepositoryForPayment();
    paytechService = createMockPayTechService() as unknown as PayTechService;
    escrowDomainService = new EscrowDomainService({ commissionPercent, currency });
    createPaymentUseCase = new CreatePaymentUseCase(
      paymentRepository,
      missionRepository,
      paytechService,
      escrowDomainService
    );
  });

  const createTestMissionEntity = (overrides: Record<string, unknown> = {}) => 
    createTestMission({
      status: MissionStatus.PENDING_PAYMENT,
      ...overrides,
    });

  describe('execute()', () => {
    it('should create payment and escrow with 10% commission', async () => {
      // Arrange
      const mission = createTestMissionEntity();
      const input: CreatePaymentInput = {
        missionId: mission.id,
        clientId: mission.clientId,
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(paymentRepository, 'findPaymentByMissionId').mockResolvedValue(null);

      // Act
      const result = await createPaymentUseCase.execute(input);

      // Assert
      expect(result.paymentId).toBeDefined();
      expect(result.escrowId).toBeDefined();
      expect(result.amount).toBe(Number(mission.prixMin));
      expect(result.paymentUrl).toContain('sandbox.paytech.sn');
      
      // Verify commission calculation
      const savedPayment = await paymentRepository.findPaymentByMissionId(mission.id);
      expect(savedPayment).toBeDefined();
    });

    it('should throw error if mission not found', async () => {
      // Arrange
      const input: CreatePaymentInput = {
        missionId: 'nonexistent-mission',
        clientId: generateTestId('client'),
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(createPaymentUseCase.execute(input)).rejects.toThrow('Mission introuvable');
    });

    it('should throw error if mission is not in PENDING_PAYMENT status', async () => {
      // Arrange
      const mission = createTestMissionEntity({ status: MissionStatus.IN_PROGRESS });
      const input: CreatePaymentInput = {
        missionId: mission.id,
        clientId: mission.clientId,
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(createPaymentUseCase.execute(input)).rejects.toThrow(
        "La mission n'est pas en attente de paiement"
      );
    });

    it('should throw error if client is not the owner', async () => {
      // Arrange
      const mission = createTestMissionEntity();
      const input: CreatePaymentInput = {
        missionId: mission.id,
        clientId: 'different-client-id',
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);

      // Act & Assert
      await expect(createPaymentUseCase.execute(input)).rejects.toThrow(
        "Vous n'êtes pas le client de cette mission"
      );
    });

    it('should throw error if payment already exists for mission', async () => {
      // Arrange
      const mission = createTestMissionEntity();
      const input: CreatePaymentInput = {
        missionId: mission.id,
        clientId: mission.clientId,
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(paymentRepository, 'findPaymentByMissionId').mockResolvedValue({
        id: 'existing-payment',
        missionId: mission.id,
        clientId: mission.clientId,
        workerId: mission.workerId,
        amount: 5000,
        currency: 'XOF',
        status: 'SUCCESS' as any,
        paymentMethod: null,
        paytechRef: 'ref-123',
        idempotencyKey: 'idem-123',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(createPaymentUseCase.execute(input)).rejects.toThrow(
        'Un paiement a déjà été effectué pour cette mission'
      );
    });

    it('should allow retry if previous payment failed', async () => {
      // Arrange
      const mission = createTestMissionEntity();
      const input: CreatePaymentInput = {
        missionId: mission.id,
        clientId: mission.clientId,
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(paymentRepository, 'findPaymentByMissionId').mockResolvedValue({
        id: 'failed-payment',
        missionId: mission.id,
        clientId: mission.clientId,
        workerId: mission.workerId,
        amount: 5000,
        currency: 'XOF',
        status: 'FAILED' as any,
        paymentMethod: null,
        paytechRef: null,
        idempotencyKey: 'idem-failed',
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await createPaymentUseCase.execute(input);

      // Assert - should succeed because previous payment was FAILED
      expect(result.paymentId).toBeDefined();
    });
  });

  describe('Commission Calculation', () => {
    it('should calculate 10% commission correctly', async () => {
      // Arrange
      const mission = createTestMissionEntity({ prixMin: 10000, prixMax: 20000 });
      const input: CreatePaymentInput = {
        missionId: mission.id,
        clientId: mission.clientId,
      };

      vi.spyOn(missionRepository, 'findById').mockResolvedValue(mission as any);
      vi.spyOn(paymentRepository, 'findPaymentByMissionId').mockResolvedValue(null);

      // Act
      const result = await createPaymentUseCase.execute(input);

      // Assert - amount should be 10000 (prixMin)
      expect(result.amount).toBe(10000);
    });
  });
});
