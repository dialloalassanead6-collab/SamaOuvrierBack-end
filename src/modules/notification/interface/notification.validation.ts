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
 * Types de notification valides
 * Correspond aux types définis dans le domain
 */
const validNotificationTypes = [
  'ACCOUNT_CREATED',
  'ACCOUNT_PENDING_APPROVAL',
  'ACCOUNT_APPROVED',
  'ACCOUNT_REJECTED',
  'MISSION_CREATED',
  'MISSION_ACCEPTED',
  'MISSION_REFUSED',
  'MISSION_COMPLETED',
  'MISSION_CANCELLED',
  'PAYMENT_RECEIVED',
  'PAYMENT_RELEASED',
  'PAYMENT_REFUNDED',
  'DISPUTE_OPENED',
  'DISPUTE_STATUS_UPDATED',
  'DISPUTE_RESOLVED',
  'REVIEW_RECEIVED',
  'SYSTEM_NOTIFICATION',
] as const;

/**
 * Schema pour les paramètres de query de liste des notifications
 * Permet de filtrer par statut, type et dates
 */
export const notificationQuerySchema = z.object({
  /** Filtrer par statut de lecture */
  status: z.enum(['UNREAD', 'READ']).optional(),
  
  /** Filtrer par type de notification */
  type: z.enum(validNotificationTypes).optional(),
  
  /** Filtrer à partir de cette date (ISO string) */
  startDate: z.string().datetime().optional(),
  
  /** Filtrer jusqu'à cette date (ISO string) */
  endDate: z.string().datetime().optional(),
  
  /** Numéro de page */
  page: z.string().regex(/^\d+$/, 'Le numéro de page doit être un nombre').optional().default('1'),
  
  /** Nombre d'éléments par page */
  pageSize: z
    .string()
    .regex(/^\d+$/, 'La taille de page doit être un nombre')
    .optional()
    .default('10'),
});

/**
 * Type inféré pour les paramètres de query
 */
export type NotificationQueryParams = z.infer<typeof notificationQuerySchema>;

/**
 * Schema pour la création d'une notification (admin uniquement)
 * Permet de créer une notification personnalisée
 */
export const createNotificationSchema = z.object({
  /** Identifiant de l'utilisateur destinataire */
  userId: z.string().uuid('L\'identifiant utilisateur doit être un UUID valide'),
  
  /** Type de notification */
  type: z.enum(validNotificationTypes),
  
  /** Titre de la notification */
  title: z
    .string()
    .min(1, 'Le titre est obligatoire')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères')
    .trim(),
  
  /** Message de la notification */
  message: z
    .string()
    .min(1, 'Le message est obligatoire')
    .max(2000, 'Le message ne doit pas dépasser 2000 caractères')
    .trim(),
  
  /** Identifiant de l'entité associée (optionnel) */
  relatedId: z.string().uuid('L\'identifiant associé doit être un UUID valide').optional(),
  
  /** Type de l'entité associée (optionnel) */
  relatedType: z.string().max(50, 'Le type associé ne doit pas dépasser 50 caractères').optional(),
});

/**
 * Type inféré pour le body de création
 */
export type CreateNotificationBody = z.infer<typeof createNotificationSchema>;

/**
 * Schema pour les paramètres d'URL (marquer comme lu)
 */
export const notificationParamsSchema = z.object({
  /** Identifiant de la notification */
  id: z.string().uuid('L\'identifiant doit être un UUID valide'),
});

/**
 * Type inféré pour les paramètres d'URL
 */
export type NotificationParams = z.infer<typeof notificationParamsSchema>;
