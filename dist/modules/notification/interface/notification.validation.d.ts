/**
 * ============================================================================
 * INTERFACE LAYER - Notification Validation
 * ============================================================================
 * Schemas Zod pour la validation des entrées du module notification
 *
 * @validation Schemas de validation pour les requêtes HTTP
 * ============================================================================
 */
import { z } from 'zod';
/**
 * Schema pour les paramètres de query de liste des notifications
 * Permet de filtrer par statut, type et dates
 */
export declare const notificationQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        UNREAD: "UNREAD";
        READ: "READ";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        ACCOUNT_REJECTED: "ACCOUNT_REJECTED";
        ACCOUNT_APPROVED: "ACCOUNT_APPROVED";
        MISSION_CREATED: "MISSION_CREATED";
        MISSION_ACCEPTED: "MISSION_ACCEPTED";
        MISSION_REFUSED: "MISSION_REFUSED";
        MISSION_COMPLETED: "MISSION_COMPLETED";
        ACCOUNT_CREATED: "ACCOUNT_CREATED";
        ACCOUNT_PENDING_APPROVAL: "ACCOUNT_PENDING_APPROVAL";
        MISSION_CANCELLED: "MISSION_CANCELLED";
        PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
        PAYMENT_RELEASED: "PAYMENT_RELEASED";
        PAYMENT_REFUNDED: "PAYMENT_REFUNDED";
        DISPUTE_OPENED: "DISPUTE_OPENED";
        DISPUTE_STATUS_UPDATED: "DISPUTE_STATUS_UPDATED";
        DISPUTE_RESOLVED: "DISPUTE_RESOLVED";
        REVIEW_RECEIVED: "REVIEW_RECEIVED";
        SYSTEM_NOTIFICATION: "SYSTEM_NOTIFICATION";
    }>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    pageSize: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Type inféré pour les paramètres de query
 */
export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>;
/**
 * Schema pour la création d'une notification (admin uniquement)
 * Permet de créer une notification personnalisée
 */
export declare const createNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodEnum<{
        ACCOUNT_REJECTED: "ACCOUNT_REJECTED";
        ACCOUNT_APPROVED: "ACCOUNT_APPROVED";
        MISSION_CREATED: "MISSION_CREATED";
        MISSION_ACCEPTED: "MISSION_ACCEPTED";
        MISSION_REFUSED: "MISSION_REFUSED";
        MISSION_COMPLETED: "MISSION_COMPLETED";
        ACCOUNT_CREATED: "ACCOUNT_CREATED";
        ACCOUNT_PENDING_APPROVAL: "ACCOUNT_PENDING_APPROVAL";
        MISSION_CANCELLED: "MISSION_CANCELLED";
        PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
        PAYMENT_RELEASED: "PAYMENT_RELEASED";
        PAYMENT_REFUNDED: "PAYMENT_REFUNDED";
        DISPUTE_OPENED: "DISPUTE_OPENED";
        DISPUTE_STATUS_UPDATED: "DISPUTE_STATUS_UPDATED";
        DISPUTE_RESOLVED: "DISPUTE_RESOLVED";
        REVIEW_RECEIVED: "REVIEW_RECEIVED";
        SYSTEM_NOTIFICATION: "SYSTEM_NOTIFICATION";
    }>;
    title: z.ZodString;
    message: z.ZodString;
    relatedId: z.ZodOptional<z.ZodString>;
    relatedType: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Type inféré pour le body de création
 */
export type CreateNotificationBody = z.infer<typeof createNotificationSchema>;
/**
 * Schema pour les paramètres d'URL (marquer comme lu)
 */
export declare const notificationParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Type inféré pour les paramètres d'URL
 */
export type NotificationParams = z.infer<typeof notificationParamsSchema>;
//# sourceMappingURL=notification.validation.d.ts.map