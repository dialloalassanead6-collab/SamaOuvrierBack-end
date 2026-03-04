import { z } from 'zod';
export declare const createDisputeSchema: z.ZodObject<{
    missionId: z.ZodString;
    reason: z.ZodEnum<{
        PAYMENT_ISSUE: "PAYMENT_ISSUE";
        WORK_NOT_DONE: "WORK_NOT_DONE";
        QUALITY_UNSATISFACTORY: "QUALITY_UNSATISFACTORY";
        NO_SHOW: "NO_SHOW";
        CANCELLATION_ISSUE: "CANCELLATION_ISSUE";
        COMMUNICATION_ISSUE: "COMMUNICATION_ISSUE";
        OTHER: "OTHER";
    }>;
    description: z.ZodString;
}, z.core.$strip>;
export declare const getDisputesQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        OPEN: "OPEN";
        UNDER_REVIEW: "UNDER_REVIEW";
        RESOLVED: "RESOLVED";
        CLOSED: "CLOSED";
    }>>;
    reporterId: z.ZodOptional<z.ZodString>;
    reportedUserId: z.ZodOptional<z.ZodString>;
    missionId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const resolveDisputeSchema: z.ZodObject<{
    disputeId: z.ZodString;
    resolution: z.ZodEnum<{
        FULL_REFUND: "FULL_REFUND";
        CLIENT_WINS: "CLIENT_WINS";
        WORKER_WINS: "WORKER_WINS";
        PARTIAL_REFUND: "PARTIAL_REFUND";
        NO_REFUND: "NO_REFUND";
        DRAW: "DRAW";
    }>;
    resolutionNote: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addEvidenceSchema: z.ZodObject<{
    disputeId: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type GetDisputesQuery = z.infer<typeof getDisputesQuerySchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type AddEvidenceInput = z.infer<typeof addEvidenceSchema>;
//# sourceMappingURL=dispute.validation.d.ts.map