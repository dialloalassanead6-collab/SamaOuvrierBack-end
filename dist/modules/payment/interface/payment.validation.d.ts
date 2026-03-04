import { z } from 'zod';
/**
 * Schéma pour créer un paiement
 */
export declare const createPaymentSchema: z.ZodObject<{
    missionId: z.ZodString;
}, z.core.$strip>;
export type CreatePaymentBody = z.infer<typeof createPaymentSchema>;
/**
 * Schéma pour libérer l'escrow
 */
export declare const releaseEscrowSchema: z.ZodObject<{
    missionId: z.ZodString;
    role: z.ZodEnum<{
        CLIENT: "CLIENT";
        WORKER: "WORKER";
    }>;
}, z.core.$strip>;
export type ReleaseEscrowBody = z.infer<typeof releaseEscrowSchema>;
/**
 * Schéma pour annuler le paiement
 */
export declare const cancelPaymentSchema: z.ZodObject<{
    missionId: z.ZodString;
    role: z.ZodEnum<{
        CLIENT: "CLIENT";
        WORKER: "WORKER";
    }>;
    cancellationType: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        DIRECT: "DIRECT";
        REQUESTED: "REQUESTED";
    }>>>;
}, z.core.$strip>;
export type CancelPaymentBody = z.infer<typeof cancelPaymentSchema>;
/**
 * Schéma pour le webhook PayTech
 */
export declare const paytechWebhookSchema: z.ZodObject<{
    ref_command: z.ZodString;
    token: z.ZodString;
    amount: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    currency: z.ZodDefault<z.ZodString>;
    status: z.ZodString;
    payment_method: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    operator: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PayTechWebhookBody = z.infer<typeof paytechWebhookSchema>;
/**
 * Schéma pour les en-têtes du webhook
 */
export declare const webhookHeadersSchema: z.ZodObject<{
    'x-paytech-signature': z.ZodString;
}, z.core.$strip>;
export type WebhookHeaders = z.infer<typeof webhookHeadersSchema>;
/**
 * Schéma pour les params d'URL
 */
export declare const missionIdParamSchema: z.ZodObject<{
    missionId: z.ZodString;
}, z.core.$strip>;
export type MissionIdParams = z.infer<typeof missionIdParamSchema>;
//# sourceMappingURL=payment.validation.d.ts.map