import { z } from 'zod';
/**
 * Zod schema for creating a mission
 *
 * VALIDATION RULES:
 * - workerId: UUID required
 * - serviceId: UUID required
 * - Note: clientId comes from the authenticated user token
 */
export declare const createMissionSchema: z.ZodObject<{
    body: z.ZodObject<{
        workerId: z.ZodString;
        serviceId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreateMissionValidation = z.infer<typeof createMissionSchema>['body'];
/**
 * Zod schema for setting final price
 *
 * VALIDATION RULES:
 * - prixFinal: positive number required (validation of range done in entity/use case)
 */
export declare const setFinalPriceSchema: z.ZodObject<{
    body: z.ZodObject<{
        prixFinal: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SetFinalPriceValidation = z.infer<typeof setFinalPriceSchema>['body'];
/**
 * Zod schema for requesting cancellation
 *
 * VALIDATION RULES:
 * - requester: must be 'CLIENT' or 'WORKER'
 */
export declare const requestCancellationSchema: z.ZodObject<{
    body: z.ZodObject<{
        requester: z.ZodEnum<{
            CLIENT: "CLIENT";
            WORKER: "WORKER";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RequestCancellationValidation = z.infer<typeof requestCancellationSchema>['body'];
/**
 * Zod schema for processing cancellation
 *
 * VALIDATION RULES:
 * - approved: boolean required (true = approve, false = reject)
 */
export declare const processCancellationSchema: z.ZodObject<{
    body: z.ZodObject<{
        approved: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ProcessCancellationValidation = z.infer<typeof processCancellationSchema>['body'];
/**
 * Zod schema for pagination query params
 */
export declare const paginationQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
        pageSize: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
        details: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean, string | undefined>>;
        clientId: z.ZodOptional<z.ZodString>;
        workerId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PaginationQueryValidation = z.infer<typeof paginationQuerySchema>['query'];
/**
 * Mission response schema (for API responses)
 * NOTE: Sensitive data (email, tel, password) are NOT included for security
 */
export declare const missionResponseSchema: z.ZodObject<{
    id: z.ZodString;
    clientId: z.ZodString;
    workerId: z.ZodString;
    serviceId: z.ZodString;
    prixMin: z.ZodNumber;
    prixMax: z.ZodNumber;
    prixFinal: z.ZodNullable<z.ZodNumber>;
    montantRestant: z.ZodNullable<z.ZodNumber>;
    cancellationRequestedBy: z.ZodNullable<z.ZodEnum<{
        CLIENT: "CLIENT";
        WORKER: "WORKER";
    }>>;
    status: z.ZodEnum<{
        PENDING_PAYMENT: "PENDING_PAYMENT";
        CONTACT_UNLOCKED: "CONTACT_UNLOCKED";
        NEGOTIATION_DONE: "NEGOTIATION_DONE";
        AWAITING_FINAL_PAYMENT: "AWAITING_FINAL_PAYMENT";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCEL_REQUESTED: "CANCEL_REQUESTED";
        CANCELLED: "CANCELLED";
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, z.core.$strip>;
export type MissionResponseValidation = z.infer<typeof missionResponseSchema>;
/**
 * Mission with details response schema
 */
export declare const missionWithDetailsSchema: z.ZodObject<{
    id: z.ZodString;
    clientId: z.ZodString;
    workerId: z.ZodString;
    serviceId: z.ZodString;
    prixMin: z.ZodNumber;
    prixMax: z.ZodNumber;
    prixFinal: z.ZodNullable<z.ZodNumber>;
    montantRestant: z.ZodNullable<z.ZodNumber>;
    cancellationRequestedBy: z.ZodNullable<z.ZodEnum<{
        CLIENT: "CLIENT";
        WORKER: "WORKER";
    }>>;
    status: z.ZodEnum<{
        PENDING_PAYMENT: "PENDING_PAYMENT";
        CONTACT_UNLOCKED: "CONTACT_UNLOCKED";
        NEGOTIATION_DONE: "NEGOTIATION_DONE";
        AWAITING_FINAL_PAYMENT: "AWAITING_FINAL_PAYMENT";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCEL_REQUESTED: "CANCEL_REQUESTED";
        CANCELLED: "CANCELLED";
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    client: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        nom: z.ZodString;
        prenom: z.ZodString;
    }, z.core.$strip>>>;
    worker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        nom: z.ZodString;
        prenom: z.ZodString;
    }, z.core.$strip>>>;
    service: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type MissionWithDetailsValidation = z.infer<typeof missionWithDetailsSchema>;
/**
 * Paginated mission list response schema
 */
export declare const missionListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        clientId: z.ZodString;
        workerId: z.ZodString;
        serviceId: z.ZodString;
        prixMin: z.ZodNumber;
        prixMax: z.ZodNumber;
        prixFinal: z.ZodNullable<z.ZodNumber>;
        montantRestant: z.ZodNullable<z.ZodNumber>;
        cancellationRequestedBy: z.ZodNullable<z.ZodEnum<{
            CLIENT: "CLIENT";
            WORKER: "WORKER";
        }>>;
        status: z.ZodEnum<{
            PENDING_PAYMENT: "PENDING_PAYMENT";
            CONTACT_UNLOCKED: "CONTACT_UNLOCKED";
            NEGOTIATION_DONE: "NEGOTIATION_DONE";
            AWAITING_FINAL_PAYMENT: "AWAITING_FINAL_PAYMENT";
            IN_PROGRESS: "IN_PROGRESS";
            COMPLETED: "COMPLETED";
            CANCEL_REQUESTED: "CANCEL_REQUESTED";
            CANCELLED: "CANCELLED";
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type MissionListResponseValidation = z.infer<typeof missionListResponseSchema>;
//# sourceMappingURL=mission.validation.d.ts.map