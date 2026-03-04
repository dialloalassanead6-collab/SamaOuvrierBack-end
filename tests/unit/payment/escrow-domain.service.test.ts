// ============================================================================
// ESCROW DOMAIN SERVICE TESTS
// ============================================================================
// Tests pour le service de domaine Escrow
// Vérifie les opérations de hold, release, et refund avec calculs de commission
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { EscrowDomainService, type EscrowConfig } from '../../../src/modules/payment/domain/services/EscrowDomainService.js';
import { Escrow, EscrowStatus } from '../../../src/modules/payment/domain/index.js';
import { PaymentStatus } from '../../../src/modules/payment/domain/index.js';

describe('EscrowDomainService', () => {
  let escrowDomainService: EscrowDomainService;

  const defaultConfig: EscrowConfig = {
    commissionPercent: 10,
    currency: 'XOF',
  };

  beforeEach(() => {
    escrowDomainService = new EscrowDomainService(defaultConfig);
  });

  describe('holdFunds()', () => {
    it('should create payment and escrow with 10% commission', () => {
      // Act
      const { payment, escrow } = escrowDomainService.holdFunds(
        'mission-123',
        'client-456',
        'worker-789',
        10000
      );

      // Assert
      expect(payment.missionId).toBe('mission-123');
      expect(payment.clientId).toBe('client-456');
      expect(payment.workerId).toBe('worker-789');
      expect(payment.amount).toBe(10000);
      expect(payment.status).toBe(PaymentStatus.PENDING);

      expect(escrow.missionId).toBe('mission-123');
      expect(escrow.amount).toBe(10000);
      expect(escrow.workerAmount).toBe(9000); // 90%
      expect(escrow.commissionAmount).toBe(1000); // 10%
      expect(escrow.status).toBe(EscrowStatus.HELD);
    });

    it('should throw error if missionId is empty', () => {
      expect(() => escrowDomainService.holdFunds('', 'client', 'worker', 5000))
        .toThrow('missionId, clientId et workerId sont requis');
    });

    it('should throw error if amount is zero', () => {
      expect(() => escrowDomainService.holdFunds('mission', 'client', 'worker', 0))
        .toThrow('Le montant doit être positif');
    });

    it('should throw error if amount is negative', () => {
      expect(() => escrowDomainService.holdFunds('mission', 'client', 'worker', -1000))
        .toThrow('Le montant doit être positif');
    });
  });

  describe('releaseFunds()', () => {
    it('should release funds from held escrow', () => {
      // Arrange
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
      const heldEscrow = escrow.hold();

      // Act
      const result = escrowDomainService.releaseFunds(heldEscrow);

      // Assert
      expect(result.escrow.status).toBe(EscrowStatus.RELEASED);
      expect(result.workerAmount).toBe(9000);
      expect(result.commissionAmount).toBe(1000);
    });

    it('should throw error if escrow is not held', () => {
      // Arrange
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
      // Not held, still PENDING

      // Act & Assert
      expect(() => escrowDomainService.releaseFunds(escrow))
        .toThrow('Impossible de libérer les fonds');
    });
  });

  describe('fullRefund()', () => {
    it('should refund full amount', () => {
      // Arrange
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
      const heldEscrow = escrow.hold();

      // Act
      const refundedEscrow = escrowDomainService.fullRefund(heldEscrow);

      // Assert
      expect(refundedEscrow.status).toBe(EscrowStatus.REFUNDED);
    });

    it('should throw error if escrow is not held', () => {
      // Arrange
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);

      // Act & Assert
      expect(() => escrowDomainService.fullRefund(escrow))
        .toThrow('Impossible de procéder au remboursement complet');
    });
  });

  describe('partialRefund()', () => {
    it('should handle client cancellation (70% client, 30% worker)', () => {
      // Arrange
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
      const heldEscrow = escrow.hold();

      // Act
      const result = escrowDomainService.partialRefund(heldEscrow, 'CLIENT');

      // Assert
      expect(result.escrow.status).toBe(EscrowStatus.PARTIALLY_REFUNDED);
      expect(result.clientAmount).toBe(7000); // 70%
      expect(result.workerAmount).toBe(3000); // 30%
    });

    it('should handle worker cancellation (100% client)', () => {
      // Arrange
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
      const heldEscrow = escrow.hold();

      // Act
      const result = escrowDomainService.partialRefund(heldEscrow, 'WORKER');

      // Assert
      expect(result.escrow.status).toBe(EscrowStatus.PARTIALLY_REFUNDED);
      expect(result.clientAmount).toBe(10000); // 100%
      expect(result.workerAmount).toBe(0);
    });

    it('should throw error if escrow is not held', () => {
      // Arrange
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);

      // Act & Assert
      expect(() => escrowDomainService.partialRefund(escrow, 'CLIENT'))
        .toThrow('Impossible de procéder au remboursement partiel');
    });
  });

  describe('calculateAmounts()', () => {
    it('should calculate amounts with 10% commission', () => {
      // Act
      const result = escrowDomainService.calculateAmounts(10000);

      // Assert
      expect(result.total).toBe(10000);
      expect(result.workerAmount).toBe(9000);
      expect(result.commissionAmount).toBe(1000);
      expect(result.commissionPercent).toBe(10);
    });

    it('should calculate amounts with custom commission', () => {
      // Arrange
      const customService = new EscrowDomainService({ ...defaultConfig, commissionPercent: 15 });

      // Act
      const result = customService.calculateAmounts(10000);

      // Assert
      expect(result.workerAmount).toBe(8500);
      expect(result.commissionAmount).toBe(1500);
      expect(result.commissionPercent).toBe(15);
    });

    it('should calculate amounts for minimum price (5000 XOF)', () => {
      // Act
      const result = escrowDomainService.calculateAmounts(5000);

      // Assert
      expect(result.workerAmount).toBe(4500);
      expect(result.commissionAmount).toBe(500);
    });
  });

  describe('markPaymentSuccess()', () => {
    it('should mark payment as success', () => {
      // Arrange
      const { payment } = escrowDomainService.holdFunds('mission', 'client', 'worker', 5000);

      // Act
      const successPayment = escrowDomainService.markPaymentSuccess(payment, 'paytech-ref');

      // Assert
      expect(successPayment.status).toBe(PaymentStatus.SUCCESS);
      expect(successPayment.paytechRef).toBe('paytech-ref');
    });
  });

  describe('markPaymentRefunded()', () => {
    it('should mark payment as refunded', () => {
      // Arrange
      const { payment } = escrowDomainService.holdFunds('mission', 'client', 'worker', 5000);
      const successPayment = escrowDomainService.markPaymentSuccess(payment);

      // Act
      const refundedPayment = escrowDomainService.markPaymentRefunded(successPayment);

      // Assert
      expect(refundedPayment.status).toBe(PaymentStatus.REFUNDED);
    });
  });
});
