import { z } from 'zod';
/**
 * Client registration schema
 * - type = "CLIENT"
 * - professionId is FORBIDDEN (must not be present)
 */
export declare const clientRegisterSchema: z.ZodObject<{
    nom: z.ZodString;
    prenom: z.ZodString;
    adresse: z.ZodString;
    tel: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    type: z.ZodLiteral<"CLIENT">;
    professionId: z.ZodUndefined;
}, z.core.$strict>;
export type ClientRegisterRequest = z.infer<typeof clientRegisterSchema>;
/**
 * Worker registration schema
 * - type = "WORKER"
 * - professionId is REQUIRED
 */
export declare const workerRegisterSchema: z.ZodObject<{
    nom: z.ZodString;
    prenom: z.ZodString;
    adresse: z.ZodString;
    tel: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    type: z.ZodLiteral<"WORKER">;
    professionId: z.ZodString;
}, z.core.$strip>;
export type WorkerRegisterRequest = z.infer<typeof workerRegisterSchema>;
/**
 * Union schema for registration (tries client first, then worker)
 */
export declare const registerSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    nom: z.ZodString;
    prenom: z.ZodString;
    adresse: z.ZodString;
    tel: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    type: z.ZodLiteral<"CLIENT">;
    professionId: z.ZodUndefined;
}, z.core.$strict>, z.ZodObject<{
    nom: z.ZodString;
    prenom: z.ZodString;
    adresse: z.ZodString;
    tel: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    type: z.ZodLiteral<"WORKER">;
    professionId: z.ZodString;
}, z.core.$strip>], "type">;
export type RegisterRequest = z.infer<typeof registerSchema>;
/**
 * Login Request DTO
 *
 * VALIDATION RULES:
 * - Email: valid format required
 * - Password: required
 */
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type LoginRequest = z.infer<typeof loginSchema>['body'];
/**
 * Auth Response DTO (common response structure)
 */
export declare const authResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        nom: z.ZodString;
        prenom: z.ZodString;
        adresse: z.ZodString;
        tel: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<{
            ADMIN: "ADMIN";
            CLIENT: "CLIENT";
            WORKER: "WORKER";
        }>;
        workerStatus: z.ZodNullable<z.ZodEnum<{
            PENDING: "PENDING";
            APPROVED: "APPROVED";
            REJECTED: "REJECTED";
        }>>;
        professionId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
    }, z.core.$strip>;
    token: z.ZodString;
}, z.core.$strip>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
/**
 * Error Response DTO
 */
export declare const errorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    code: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
//# sourceMappingURL=auth.validation.d.ts.map