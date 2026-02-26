import { z } from 'zod';
/**
 * Schema pour la raison du rejet
 */
export declare const rejectionReasonSchema: z.ZodString;
/**
 * Schema pour le body de la requête de rejet
 */
export declare const rejectWorkerSchema: z.ZodObject<{
    rejectionReason: z.ZodString;
}, z.core.$strip>;
/**
 * Type inféré pour le body de la requête de rejet
 */
export type RejectWorkerBody = z.infer<typeof rejectWorkerSchema>;
/**
 * Schema pour les paramètres de query de liste des workers
 */
export declare const listWorkersQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>>;
    skip: z.ZodOptional<z.ZodString>;
    take: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Type inféré pour les paramètres de query de liste des workers
 */
export type ListWorkersQuery = z.infer<typeof listWorkersQuerySchema>;
//# sourceMappingURL=admin.validation.d.ts.map