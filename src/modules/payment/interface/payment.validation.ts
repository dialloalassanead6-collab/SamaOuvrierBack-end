// ============================================================================
// PAYMENT VALIDATION SCHEMAS - INTERFACE LAYER
// ============================================================================
// Schémas de validation Zod pour les endpoints de paiement
// ============================================================================

import { z } from 'zod';

/**
 * Schéma pour créer un paiement
 */
export const createPaymentSchema = z.object({
  missionId: z.string().uuid({ message: 'ID de mission invalide' }),
});

export type CreatePaymentBody = z.infer<typeof createPaymentSchema>;

/**
 * Schéma pour libérer l'escrow
 */
export const releaseEscrowSchema = z.object({
  missionId: z.string().uuid({ message: 'ID de mission invalide' }),
  role: z.enum(['CLIENT', 'WORKER']),
});

export type ReleaseEscrowBody = z.infer<typeof releaseEscrowSchema>;

/**
 * Schéma pour annuler le paiement
 */
export const cancelPaymentSchema = z.object({
  missionId: z.string().uuid({ message: 'ID de mission invalide' }),
  role: z.enum(['CLIENT', 'WORKER']),
  cancellationType: z.enum(['DIRECT', 'REQUESTED']).optional().default('DIRECT'),
});

export type CancelPaymentBody = z.infer<typeof cancelPaymentSchema>;

/**
 * Schéma pour le webhook PayTech
 */
export const paytechWebhookSchema = z.object({
  ref_command: z.string().min(1, 'référence de commande manquante'),
  token: z.string().min(1, 'token manquant'),
  amount: z.string().transform((val) => parseFloat(val)),
  currency: z.string().default('XOF'),
  status: z.string(),
  payment_method: z.string().optional(),
  phone_number: z.string().optional(),
  operator: z.string().optional(),
});

export type PayTechWebhookBody = z.infer<typeof paytechWebhookSchema>;

/**
 * Schéma pour les en-têtes du webhook
 */
export const webhookHeadersSchema = z.object({
  'x-paytech-signature': z.string().min(1, 'signature manquante'),
});

export type WebhookHeaders = z.infer<typeof webhookHeadersSchema>;

/**
 * Schéma pour les params d'URL
 */
export const missionIdParamSchema = z.object({
  missionId: z.string().uuid({ message: 'ID de mission invalide' }),
});

export type MissionIdParams = z.infer<typeof missionIdParamSchema>;
