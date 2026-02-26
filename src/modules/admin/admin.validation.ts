// ============================================================================
// VALIDATION - Worker Validation
// ============================================================================
// Schemas Zod pour la validation des entrées de la gestion des workers
// ============================================================================

import { z } from 'zod';

/**
 * Schema pour la raison du rejet
 */
export const rejectionReasonSchema = z
  .string()
  .min(1, 'La raison du rejet est obligatoire.')
  .max(1000, 'La raison du rejet ne doit pas dépasser 1000 caractères.')
  .trim();

/**
 * Schema pour le body de la requête de rejet
 */
export const rejectWorkerSchema = z.object({
  rejectionReason: rejectionReasonSchema,
});

/**
 * Type inféré pour le body de la requête de rejet
 */
export type RejectWorkerBody = z.infer<typeof rejectWorkerSchema>;

/**
 * Schema pour les paramètres de query de liste des workers
 */
export const listWorkersQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  skip: z.string().regex(/^\d+$/, 'Skip doit être un nombre').optional(),
  take: z.string().regex(/^\d+$/, 'Take doit être un nombre').optional(),
});

/**
 * Type inféré pour les paramètres de query de liste des workers
 */
export type ListWorkersQuery = z.infer<typeof listWorkersQuerySchema>;
