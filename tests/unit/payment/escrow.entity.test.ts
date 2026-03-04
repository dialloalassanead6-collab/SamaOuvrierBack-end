// ============================================================================
// ESCROW ENTITY UNIT TESTS
// ============================================================================
// Tests pour l'entité Escrow et sa machine à états
// Vérifie la commission 10% pour l'application
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { Escrow, EscrowStatus } from '../../../src/modules/payment/domain/index.js';

describe('Escrow Entity', () => {
  // Données de test valides
  const validEscrowProps = {
    id: 'test-escrow-id',
    paymentId: 'payment-123',
    missionId: 'mission-456',
    amount: 5000,
    workerAmount: 4500,
    commissionAmount: 500,
    status: EscrowStatus.HELD,
    releaseType: null,
    paytechRef: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    releasedAt: null,
  };

  describe('Constructor', () => {
    it('should create an escrow with valid props', () => {
      const escrow = new Escrow(validEscrowProps);
      
      expect(escrow.id).toBe(validEscrowProps.id);
      expect(escrow.missionId).toBe(validEscrowProps.missionId);
      expect(escrow.amount).toBe(5000);
      expect(escrow.workerAmount).toBe(4500);
      expect(escrow.commissionAmount).toBe(500);
      expect(escrow.status).toBe(EscrowStatus.HELD);
    });

    it('should throw error if amount is negative', () => {
      expect(() => new Escrow({
        ...validEscrowProps,
        amount: -100,
      })).toThrow("Le montant de l'escrow ne peut pas être négatif");
    });

    it('should throw error if workerAmount is negative', () => {
      expect(() => new Escrow({
        ...validEscrowProps,
        workerAmount: -100,
      })).toThrow("Le montant pour le worker ne peut pas être négatif");
    });

    it('should throw error if commissionAmount is negative', () => {
      expect(() => new Escrow({
        ...validEscrowProps,
        commissionAmount: -100,
      })).toThrow("Le montant de la commission ne peut pas être négatif");
    });

    it('should throw error if workerAmount + commissionAmount > amount', () => {
      expect(() => new Escrow({
        ...validEscrowProps,
        workerAmount: 4000,
        commissionAmount: 2000, // 6000 > 5000
      })).toThrow('La somme workerAmount + commissionAmount ne peut pas dépasser amount');
    });
  });

  describe('Factory Method - create()', () => {
    it('should create escrow with 10% commission', () => {
      const escrow = Escrow.create(
        'payment-123',
        'mission-456',
        10000,
        10 // 10% commission
      );
      
      expect(escrow.amount).toBe(10000);
      expect(escrow.workerAmount).toBe(9000); // 10000 - 1000
      expect(escrow.commissionAmount).toBe(1000); // 10% of 10000
      expect(escrow.status).toBe(EscrowStatus.PENDING);
    });

    it('should create escrow with custom commission percentage', () => {
      const escrow = Escrow.create(
        'payment-123',
        'mission-456',
        10000,
        15 // 15% commission
      );
      
      expect(escrow.workerAmount).toBe(8500);
      expect(escrow.commissionAmount).toBe(1500);
    });

    it('should create escrow with 0% commission', () => {
      const escrow = Escrow.create(
        'payment-123',
        'mission-456',
        5000,
        0
      );
      
      expect(escrow.workerAmount).toBe(5000);
      expect(escrow.commissionAmount).toBe(0);
    });
  });

  describe('State Machine Transitions', () => {
    describe('hold()', () => {
      it('should transition from PENDING to HELD', () => {
        const escrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.PENDING,
        });
        
        const heldEscrow = escrow.hold('paytech-hold-ref');
        
        expect(heldEscrow.status).toBe(EscrowStatus.HELD);
        expect(heldEscrow.paytechRef).toBe('paytech-hold-ref');
      });

      it('should throw error if status is not PENDING', () => {
        const escrow = new Escrow(validEscrowProps);
        
        expect(() => escrow.hold()).toThrow(
          'Impossible de bloquer les fonds'
        );
      });
    });

    describe('release()', () => {
      it('should transition from HELD to RELEASED', () => {
        const escrow = new Escrow(validEscrowProps);
        const releasedEscrow = escrow.release('paytech-release-ref');
        
        expect(releasedEscrow.status).toBe(EscrowStatus.RELEASED);
        expect(releasedEscrow.releaseType).toBe('FULL');
        expect(releasedEscrow.releasedAt).toBeInstanceOf(Date);
      });

      it('should throw error if status is not HELD', () => {
        const escrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.PENDING,
        });
        
        expect(() => escrow.release()).toThrow(
          'Impossible de libérer les fonds'
        );
      });
    });

    describe('fullRefund()', () => {
      it('should transition from HELD to REFUNDED', () => {
        const escrow = new Escrow(validEscrowProps);
        const refundedEscrow = escrow.fullRefund('paytech-refund-ref');
        
        expect(refundedEscrow.status).toBe(EscrowStatus.REFUNDED);
        expect(refundedEscrow.releaseType).toBe('FULL_REFUND');
        expect(refundedEscrow.releasedAt).toBeInstanceOf(Date);
      });

      it('should throw error if status is not HELD', () => {
        const escrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.PENDING,
        });
        
        expect(() => escrow.fullRefund()).toThrow(
          'Impossible de procéder au remboursement complet'
        );
      });
    });

    describe('partialRefund()', () => {
      it('should transition from HELD to PARTIALLY_REFUNDED (client cancels)', () => {
        const escrow = new Escrow(validEscrowProps);
        // Client cancels: 70% client, 30% worker
        const partiallyRefundedEscrow = escrow.partialRefund(70, 1500);
        
        expect(partiallyRefundedEscrow.status).toBe(EscrowStatus.PARTIALLY_REFUNDED);
        expect(partiallyRefundedEscrow.releaseType).toBe('PARTIAL');
      });

      it('should throw error if percentage is invalid', () => {
        const escrow = new Escrow(validEscrowProps);
        
        expect(() => escrow.partialRefund(150, 1500)).toThrow(
          'Le pourcentage de remboursement doit être entre 0 et 100'
        );
      });

      it('should throw error if status is not HELD', () => {
        const escrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.PENDING,
        });
        
        expect(() => escrow.partialRefund(50, 2500)).toThrow(
          'Impossible de procéder au remboursement partiel'
        );
      });
    });
  });

  describe('Commission Calculation', () => {
    it('should correctly calculate 10% commission', () => {
      const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
      
      expect(escrow.commissionAmount).toBe(1000);
      expect(escrow.workerAmount).toBe(9000);
      expect(escrow.getCommissionPercent()).toBe(10);
    });

    it('should correctly calculate commission for 5000 XOF (prixMin)', () => {
      const escrow = Escrow.create('payment-1', 'mission-1', 5000, 10);
      
      expect(escrow.commissionAmount).toBe(500);
      expect(escrow.workerAmount).toBe(4500);
    });

    it('should return 0% commission for 0 amount', () => {
      const escrow = Escrow.create('payment-1', 'mission-1', 0, 10);
      
      expect(escrow.getCommissionPercent()).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    describe('isHeld()', () => {
      it('should return true for HELD status', () => {
        const escrow = new Escrow(validEscrowProps);
        expect(escrow.isHeld()).toBe(true);
      });

      it('should return false for other statuses', () => {
        const releasedEscrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.RELEASED,
        });
        expect(releasedEscrow.isHeld()).toBe(false);
      });
    });

    describe('isReleased()', () => {
      it('should return true for RELEASED status', () => {
        const escrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.RELEASED,
        });
        expect(escrow.isReleased()).toBe(true);
      });
    });

    describe('isRefunded()', () => {
      it('should return true for REFUNDED status', () => {
        const escrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.REFUNDED,
        });
        expect(escrow.isRefunded()).toBe(true);
      });
    });

    describe('isPartiallyRefunded()', () => {
      it('should return true for PARTIALLY_REFUNDED status', () => {
        const escrow = new Escrow({
          ...validEscrowProps,
          status: EscrowStatus.PARTIALLY_REFUNDED,
        });
        expect(escrow.isPartiallyRefunded()).toBe(true);
      });
    });

    describe('toProps()', () => {
      it('should convert to plain object', () => {
        const escrow = new Escrow(validEscrowProps);
        const props = escrow.toProps();
        
        expect(props.id).toBe(validEscrowProps.id);
        expect(props.missionId).toBe(validEscrowProps.missionId);
        expect(props.amount).toBe(5000);
        expect(props.status).toBe(EscrowStatus.HELD);
      });
    });
  });

  describe('Invalid Transitions', () => {
    it('should not allow transition from RELEASED to HELD', () => {
      const escrow = new Escrow({
        ...validEscrowProps,
        status: EscrowStatus.RELEASED,
      });
      
      expect(escrow.canTransitionTo(EscrowStatus.HELD)).toBe(false);
    });

    it('should not allow transition from REFUNDED to HELD', () => {
      const escrow = new Escrow({
        ...validEscrowProps,
        status: EscrowStatus.REFUNDED,
      });
      
      expect(escrow.canTransitionTo(EscrowStatus.HELD)).toBe(false);
    });

    it('should not allow direct transition from PENDING to RELEASED', () => {
      const escrow = new Escrow({
        ...validEscrowProps,
        status: EscrowStatus.PENDING,
      });
      
      expect(escrow.canTransitionTo(EscrowStatus.RELEASED)).toBe(false);
    });
  });

  describe('Cancellation Scenarios', () => {
    describe('Client Cancellation', () => {
      it('should handle 70/30 split when client cancels', () => {
        const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
        const heldEscrow = escrow.hold();
        
        // Client cancels: 70% client gets back, 30% to worker
        const refunded = heldEscrow.partialRefund(70, 3000);
        
        expect(refunded.status).toBe(EscrowStatus.PARTIALLY_REFUNDED);
      });
    });

    describe('Worker Cancellation', () => {
      it('should handle 100% refund to client when worker cancels', () => {
        const escrow = Escrow.create('payment-1', 'mission-1', 10000, 10);
        const heldEscrow = escrow.hold();
        
        // Worker cancels: 100% to client
        const refunded = heldEscrow.partialRefund(100, 0);
        
        expect(refunded.status).toBe(EscrowStatus.PARTIALLY_REFUNDED);
      });
    });
  });
});
