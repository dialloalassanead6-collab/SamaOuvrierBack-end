/**
 * Review Validation
 * Zod schemas for request validation
 */
import { z } from 'zod';
export const createReviewSchema = z.object({
    body: z.object({
        missionId: z.string().uuid('Invalid mission ID format'),
        rating: z.number()
            .int('Rating must be an integer')
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating must be at most 5'),
        comment: z.string().max(1000, 'Comment must be at most 1000 characters').optional(),
    }),
});
export const getWorkerReviewsSchema = z.object({
    params: z.object({
        workerId: z.string().uuid('Invalid worker ID format'),
    }),
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        limit: z.coerce.number().int().positive().max(100).optional().default(10),
    }),
});
export const deleteReviewSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid review ID format'),
    }),
});
//# sourceMappingURL=review.validation.js.map