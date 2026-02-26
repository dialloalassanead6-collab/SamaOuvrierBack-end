// Interface Layer - Auth DTOs with Zod Validation
// Data Transfer Objects for authentication endpoints
import { z } from 'zod';
/**
 * Base common fields for registration
 */
const baseRegisterSchema = z.object({
    nom: z
        .string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must not exceed 100 characters'),
    prenom: z
        .string()
        .min(1, 'First name is required')
        .max(100, 'First name must not exceed 100 characters'),
    adresse: z
        .string()
        .min(1, 'Address is required')
        .max(255, 'Address must not exceed 255 characters'),
    tel: z
        .string()
        .min(1, 'Phone number is required')
        .max(20, 'Phone number must not exceed 20 characters'),
    email: z
        .string()
        .email('Invalid email format')
        .max(255, 'Email must not exceed 255 characters'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .max(100, 'Password must not exceed 100 characters'),
});
/**
 * Client registration schema
 * - type = "CLIENT"
 * - professionId is FORBIDDEN (must not be present)
 */
export const clientRegisterSchema = baseRegisterSchema.extend({
    type: z.literal('CLIENT'),
    professionId: z.undefined(),
}).strict();
/**
 * Worker registration schema
 * - type = "WORKER"
 * - professionId is REQUIRED
 */
export const workerRegisterSchema = baseRegisterSchema.extend({
    type: z.literal('WORKER'),
    professionId: z
        .string()
        .uuid('Invalid profession ID format')
        .min(1, 'Profession is required for worker registration'),
});
/**
 * Union schema for registration (tries client first, then worker)
 */
export const registerSchema = z.discriminatedUnion('type', [
    clientRegisterSchema,
    workerRegisterSchema,
]);
/**
 * Login Request DTO
 *
 * VALIDATION RULES:
 * - Email: valid format required
 * - Password: required
 */
export const loginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .email('Invalid email format')
            .max(255, 'Email must not exceed 255 characters'),
        password: z
            .string()
            .min(1, 'Password is required')
            .max(100, 'Password must not exceed 100 characters'),
    }),
});
/**
 * Auth Response DTO (common response structure)
 */
export const authResponseSchema = z.object({
    user: z.object({
        id: z.string().uuid(),
        nom: z.string().max(100),
        prenom: z.string().max(100),
        adresse: z.string().max(255),
        tel: z.string().max(20),
        email: z.string().email(),
        role: z.enum(['ADMIN', 'CLIENT', 'WORKER']),
        workerStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).nullable(),
        professionId: z.string().uuid().nullable(),
        createdAt: z.date(),
    }),
    token: z.string().min(1),
});
/**
 * Error Response DTO
 */
export const errorResponseSchema = z.object({
    error: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
    code: z.string().optional(),
});
//# sourceMappingURL=auth.validation.js.map