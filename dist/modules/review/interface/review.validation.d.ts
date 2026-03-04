/**
 * Review Validation
 * Zod schemas for request validation
 */
import { z } from 'zod';
export declare const createReviewSchema: z.ZodObject<{
    body: z.ZodObject<{
        missionId: z.ZodString;
        rating: z.ZodNumber;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getWorkerReviewsSchema: z.ZodObject<{
    params: z.ZodObject<{
        workerId: z.ZodString;
    }, z.core.$strip>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const deleteReviewSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type GetWorkerReviewsInput = z.infer<typeof getWorkerReviewsSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
//# sourceMappingURL=review.validation.d.ts.map