// ============================================================================
// DISPUTE VALIDATION - Interface Layer
// ============================================================================
// Zod schemas for request validation
// ============================================================================
import { z } from 'zod';
// Dispute reasons enum validation
const disputeReasonEnum = z.enum([
    'PAYMENT_ISSUE',
    'WORK_NOT_DONE',
    'QUALITY_UNSATISFACTORY',
    'NO_SHOW',
    'CANCELLATION_ISSUE',
    'COMMUNICATION_ISSUE',
    'OTHER',
]);
// Dispute status enum validation
const disputeStatusEnum = z.enum([
    'PENDING',
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED',
    'CLOSED',
]);
// Dispute resolution enum validation
const disputeResolutionEnum = z.enum([
    'CLIENT_WINS',
    'WORKER_WINS',
    'PARTIAL_REFUND',
    'FULL_REFUND',
    'NO_REFUND',
    'DRAW',
]);
// UUID validation
const uuidSchema = z.string().uuid({
    message: 'ID invalide',
});
// Create dispute validation
export const createDisputeSchema = z.object({
    missionId: uuidSchema,
    reason: disputeReasonEnum,
    description: z.string()
        .min(20, 'La description doit contenir au moins 20 caractères')
        .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
});
// Get disputes validation
export const getDisputesQuerySchema = z.object({
    status: disputeStatusEnum.optional(),
    reporterId: uuidSchema.optional(),
    reportedUserId: uuidSchema.optional(),
    missionId: uuidSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});
// Resolve dispute validation
export const resolveDisputeSchema = z.object({
    disputeId: uuidSchema,
    resolution: disputeResolutionEnum,
    resolutionNote: z.string()
        .max(1000, 'Les notes de résolution ne peuvent pas dépasser 1000 caractères')
        .optional(),
});
// Add evidence validation (for multipart/form-data)
// This validates the text fields, files are validated separately
export const addEvidenceSchema = z.object({
    disputeId: uuidSchema,
    description: z.string()
        .max(500, 'La description ne peut pas dépasser 500 caractères')
        .optional(),
});
//# sourceMappingURL=dispute.validation.js.map