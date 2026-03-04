// ============================================================================
// PAYMENT ENTITY UNIT TESTS
// ============================================================================
// Tests pour l'entité Payment et sa machine à états
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { Payment, PaymentStatus } from '../../../src/modules/payment/domain/index.js';

describe('Payment Entity', () => {
  // Données de test valides
  const validPaymentProps = {
    id: 'test-payment-id',
    missionId: 'mission-123',
    clientId: 'client-456',
    workerId: 'worker-789',
    amount: 5000,
    currency: 'XOF',
    status: PaymentStatus.PENDING,
    paymentMethod: null,
    paytechRef: null,
    idempotencyKey: 'idem-123',
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Constructor', () => {
    it('should create a payment with valid props', () => {
      const payment = new Payment(validPaymentProps);
      
      expect(payment.id).toBe(validPaymentProps.id);
      expect(payment.missionId).toBe(validPaymentProps.missionId);
      expect(payment.amount).toBe(5000);
      expect(payment.currency).toBe('XOF');
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should convert currency to uppercase', () => {
      const payment = new Payment({
        ...validPaymentProps,
        currency: 'xof',
      });
      
      expect(payment.currency).toBe('XOF');
    });

    it('should throw error if amount is negative', () => {
      expect(() => new Payment({
        ...validPaymentProps,
        amount: -100,
      })).toThrow('Le montant du paiement ne peut pas être négatif');
    });

    it('should throw error if currency is invalid', () => {
      expect(() => new Payment({
        ...validPaymentProps,
        currency: 'INVALID',
      })).toThrow('Devise invalide: INVALID');
    });

    it('should allow valid currencies: XOF, EUR, USD', () => {
      const xof = new Payment({ ...validPaymentProps, currency: 'XOF' });
      const eur = new Payment({ ...validPaymentProps, currency: 'EUR' });
      const usd = new Payment({ ...validPaymentProps, currency: 'USD' });
      
      expect(xof.currency).toBe('XOF');
      expect(eur.currency).toBe('EUR');
      expect(usd.currency).toBe('USD');
    });
  });

  describe('State Machine Transitions', () => {
    describe('markAsSuccess()', () => {
      it('should transition from PENDING to SUCCESS', () => {
        const payment = new Payment(validPaymentProps);
        const successPayment = payment.markAsSuccess('paytech-ref-123');
        
        expect(successPayment.status).toBe(PaymentStatus.SUCCESS);
        expect(successPayment.paytechRef).toBe('paytech-ref-123');
      });

      it('should throw error if status is not PENDING', () => {
        const payment = new Payment({
          ...validPaymentProps,
          status: PaymentStatus.SUCCESS,
        });
        
        expect(() => payment.markAsSuccess()).toThrow(
          'Impossible de marquer le paiement comme réussi'
        );
      });
    });

    describe('markAsFailed()', () => {
      it('should transition from PENDING to FAILED', () => {
        const payment = new Payment(validPaymentProps);
        const failedPayment = payment.markAsFailed();
        
        expect(failedPayment.status).toBe(PaymentStatus.FAILED);
      });

      it('should throw error if status is not PENDING', () => {
        const payment = new Payment({
          ...validPaymentProps,
          status: PaymentStatus.SUCCESS,
        });
        
        expect(() => payment.markAsFailed()).toThrow(
          'Impossible de marquer le paiement comme échoué'
        );
      });
    });

    describe('markAsRefunded()', () => {
      it('should transition from SUCCESS to REFUNDED', () => {
        const payment = new Payment({
          ...validPaymentProps,
          status: PaymentStatus.SUCCESS,
        });
        
        const refundedPayment = payment.markAsRefunded();
        
        expect(refundedPayment.status).toBe(PaymentStatus.REFUNDED);
      });

      it('should throw error if status is not SUCCESS', () => {
        const payment = new Payment(validPaymentProps);
        
        expect(() => payment.markAsRefunded()).toThrow(
          'Impossible de marquer le paiement comme remboursé'
        );
      });
    });

    describe('cancel()', () => {
      it('should transition from PENDING to CANCELLED', () => {
        const payment = new Payment(validPaymentProps);
        const cancelledPayment = payment.cancel();
        
        expect(cancelledPayment.status).toBe(PaymentStatus.CANCELLED);
      });

      it('should throw error if status is not PENDING', () => {
        const payment = new Payment({
          ...validPaymentProps,
          status: PaymentStatus.SUCCESS,
        });
        
        expect(() => payment.cancel()).toThrow(
          "Impossible d'annuler le paiement"
        );
      });
    });
  });

  describe('Utility Methods', () => {
    describe('isPending()', () => {
      it('should return true for PENDING status', () => {
        const payment = new Payment(validPaymentProps);
        expect(payment.isPending()).toBe(true);
      });

      it('should return false for other statuses', () => {
        const successPayment = new Payment({
          ...validPaymentProps,
          status: PaymentStatus.SUCCESS,
        });
        expect(successPayment.isPending()).toBe(false);
      });
    });

    describe('isSuccessful()', () => {
      it('should return true for SUCCESS status', () => {
        const payment = new Payment({
          ...validPaymentProps,
          status: PaymentStatus.SUCCESS,
        });
        expect(payment.isSuccessful()).toBe(true);
      });

      it('should return false for other statuses', () => {
        const pendingPayment = new Payment(validPaymentProps);
        expect(pendingPayment.isSuccessful()).toBe(false);
      });
    });

    describe('canBeRefunded()', () => {
      it('should return true only for SUCCESS status', () => {
        const successPayment = new Payment({
          ...validPaymentProps,
          status: PaymentStatus.SUCCESS,
        });
        expect(successPayment.canBeRefunded()).toBe(true);

        const pendingPayment = new Payment(validPaymentProps);
        expect(pendingPayment.canBeRefunded()).toBe(false);
      });
    });

    describe('toProps()', () => {
      it('should convert to plain object', () => {
        const payment = new Payment(validPaymentProps);
        const props = payment.toProps();
        
        expect(props.id).toBe(validPaymentProps.id);
        expect(props.missionId).toBe(validPaymentProps.missionId);
        expect(props.amount).toBe(5000);
        expect(props.status).toBe(PaymentStatus.PENDING);
      });
    });
  });

  describe('Invalid Transitions', () => {
    it('should not allow transition from SUCCESS to PENDING', () => {
      const payment = new Payment({
        ...validPaymentProps,
        status: PaymentStatus.SUCCESS,
      });
      
      expect(payment.canTransitionTo(PaymentStatus.PENDING)).toBe(false);
    });

    it('should not allow transition from REFUNDED to SUCCESS', () => {
      const payment = new Payment({
        ...validPaymentProps,
        status: PaymentStatus.REFUNDED,
      });
      
      expect(payment.canTransitionTo(PaymentStatus.SUCCESS)).toBe(false);
    });

    it('should not allow transition from CANCELLED to SUCCESS', () => {
      const payment = new Payment({
        ...validPaymentProps,
        status: PaymentStatus.CANCELLED,
      });
      
      expect(payment.canTransitionTo(PaymentStatus.SUCCESS)).toBe(false);
    });
  });
});
