// ============================================================================
// MISSION VALIDATION SCHEMAS - INTERFACE LAYER
// ============================================================================
// Zod validation schemas for Mission DTOs
// Provides strict TypeScript validation without any 'any' types
// ============================================================================

import { z } from 'zod';

/**
 * Zod schema for creating a mission
 * 
 * VALIDATION RULES:
 * - workerId: UUID required
 * - serviceId: UUID required
 * - Note: clientId comes from the authenticated user token
 */
export const createMissionSchema = z.object({
  body: z.object({
    workerId: z
      .string()
      .uuid('Invalid worker ID format')
      .min(1, 'Worker ID is required'),
    serviceId: z
      .string()
      .uuid('Invalid service ID format')
      .min(1, 'Service ID is required'),
  }),
});

export type CreateMissionValidation = z.infer<typeof createMissionSchema>['body'];

/**
 * Zod schema for setting final price
 * 
 * VALIDATION RULES:
 * - prixFinal: positive number required (validation of range done in entity/use case)
 */
export const setFinalPriceSchema = z.object({
  body: z.object({
    prixFinal: z
      .number()
      .positive('Prix final must be positive')
      .finite('Prix final must be a finite number'),
  }),
});

export type SetFinalPriceValidation = z.infer<typeof setFinalPriceSchema>['body'];

/**
 * Zod schema for requesting cancellation
 * 
 * VALIDATION RULES:
 * - requester: must be 'CLIENT' or 'WORKER'
 */
export const requestCancellationSchema = z.object({
  body: z.object({
    requester: z.enum(['CLIENT', 'WORKER']),
  }),
});

export type RequestCancellationValidation = z.infer<typeof requestCancellationSchema>['body'];

/**
 * Zod schema for processing cancellation
 * 
 * VALIDATION RULES:
 * - approved: boolean required (true = approve, false = reject)
 */
export const processCancellationSchema = z.object({
  body: z.object({
    approved: z.boolean(),
  }),
});

export type ProcessCancellationValidation = z.infer<typeof processCancellationSchema>['body'];

/**
 * Zod schema for pagination query params
 */
export const paginationQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    pageSize: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    details: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    clientId: z
      .string()
      .uuid('Invalid client ID format')
      .optional(),
    workerId: z
      .string()
      .uuid('Invalid worker ID format')
      .optional(),
  }),
});

export type PaginationQueryValidation = z.infer<typeof paginationQuerySchema>['query'];

/**
 * Mission response schema (for API responses)
 * NOTE: Sensitive data (email, tel, password) are NOT included for security
 */
export const missionResponseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  workerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  prixMin: z.number(),
  prixMax: z.number(),
  prixFinal: z.number().nullable(),
  montantRestant: z.number().nullable(),
  cancellationRequestedBy: z.enum(['CLIENT', 'WORKER']).nullable(),
  status: z.enum([
    'PENDING_PAYMENT',
    'CONTACT_UNLOCKED',
    'NEGOTIATION_DONE',
    'AWAITING_FINAL_PAYMENT',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCEL_REQUESTED',
    'CANCELLED',
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MissionResponseValidation = z.infer<typeof missionResponseSchema>;

/**
 * Mission with details response schema
 */
export const missionWithDetailsSchema = missionResponseSchema.extend({
  client: z
    .object({
      id: z.string().uuid(),
      nom: z.string(),
      prenom: z.string(),
    })
    .nullable()
    .optional(),
  worker: z
    .object({
      id: z.string().uuid(),
      nom: z.string(),
      prenom: z.string(),
    })
    .nullable()
    .optional(),
  service: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
    })
    .nullable()
    .optional(),
});

export type MissionWithDetailsValidation = z.infer<typeof missionWithDetailsSchema>;

/**
 * Paginated mission list response schema
 */
export const missionListResponseSchema = z.object({
  data: z.array(missionResponseSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type MissionListResponseValidation = z.infer<typeof missionListResponseSchema>;
