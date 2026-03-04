// ============================================================================
// MOCK PAYTECH SERVICE
// ============================================================================
// Mock du service PayTech pour les tests
// Simule le comportement de PayTech en mode sandbox
// ============================================================================

import { vi } from 'vitest';
import type { PayTechService, PayTechConfig, PayTechResponse, PayTechWebhookPayload } from '../../src/modules/payment/infrastructure/paytech/PayTechService.js';

/**
 * Configuration de test pour PayTech
 */
export const testPayTechConfig: PayTechConfig = {
  apiKey: 'test-api-key',
  apiSecret: 'test-api-secret',
  baseUrl: 'https://sandbox.paytech.sn/api',
  env: 'test',
  ipnUrl: 'https://test.example.com/api/payments/callback',
  successUrl: 'https://test.example.com/success',
  cancelUrl: 'https://test.example.com/cancel',
};

/**
 * Crée un mock du PayTechService
 */
export const createMockPayTechService = () => {
  const mock = {
    createPaymentRequest: vi.fn().mockResolvedValue('https://sandbox.paytech.sn/payment/test-token'),
    verifyWebhookSignature: vi.fn().mockReturnValue({ isValid: true }),
    processWebhook: vi.fn().mockReturnValue({
      status: 'SUCCESS' as const,
      refCommand: 'test-ref',
      amount: 5000,
    }),
    refund: vi.fn().mockResolvedValue(true),
    generateIdempotencyKey: vi.fn().mockImplementation((prefix: string) => {
      return `${prefix}-${Date.now()}-test`;
    }),
  };

  return mock as unknown as PayTechService & {
    createPaymentRequest: ReturnType<typeof vi.fn>;
    verifyWebhookSignature: ReturnType<typeof vi.fn>;
    processWebhook: ReturnType<typeof vi.fn>;
    refund: ReturnType<typeof vi.fn>;
    generateIdempotencyKey: ReturnType<typeof vi.fn>;
  };
};

/**
 * Simule une réponse PayTech réussie
 */
export const mockPayTechSuccessResponse: PayTechResponse = {
  success: true,
  message: 'Payment request created',
  data: {
    payment_url: 'https://sandbox.paytech.sn/payment/test-token-123',
    token: 'test-token-123',
    ref_command: 'test-ref-123',
  },
};

/**
 * Simule un webhook PayTech de paiement réussi
 */
export const mockPayTechSuccessWebhook: PayTechWebhookPayload = {
  ref_command: 'mission-test-123',
  token: 'test-token-123',
  amount: '5000',
  currency: 'XOF',
  status: '000', // SUCCESS
  payment_method: 'mobile_money',
  phone_number: '+221771234567',
  operator: 'orange',
};

/**
 * Simule un webhook PayTech de paiement échoué
 */
export const mockPayTechFailedWebhook: PayTechWebhookPayload = {
  ref_command: 'mission-test-123',
  token: 'test-token-123',
  amount: '5000',
  currency: 'XOF',
  status: '001', // FAILED
  payment_method: 'mobile_money',
  phone_number: '+221771234567',
  operator: 'orange',
};

/**
 * Simule un webhook PayTech de paiement en attente
 */
export const mockPayTechPendingWebhook: PayTechWebhookPayload = {
  ref_command: 'mission-test-123',
  token: 'test-token-123',
  amount: '5000',
  currency: 'XOF',
  status: '002', // PENDING
  payment_method: 'mobile_money',
  phone_number: '+221771234567',
  operator: 'orange',
};

/**
 * Factory pour créer des réponses PayTech simulées
 */
export const createPayTechResponse = (type: 'success' | 'failed' | 'pending'): PayTechResponse => {
  switch (type) {
    case 'success':
      return mockPayTechSuccessResponse;
    case 'failed':
      return {
        success: false,
        message: 'Payment failed',
        errors: { status: ['Payment was declined'] },
      };
    case 'pending':
      return {
        success: true,
        message: 'Payment pending',
        data: {
          payment_url: 'https://sandbox.paytech.sn/payment/pending-token',
          token: 'pending-token',
          ref_command: 'test-ref-pending',
        },
      };
  }
};
