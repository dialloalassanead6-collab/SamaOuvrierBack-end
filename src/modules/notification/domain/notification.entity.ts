/**
 * ============================================================================
 * DOMAIN LAYER - Notification Entity
 * ============================================================================
 * Ce fichier définit l'entité Notification qui représente une notification
 * dans le système SamaOuvrier.
 * 
 * Cette entité est la représentation centrale de la notification dans le
 * domain model. Elle est indépendante de tout framework ou base de données.
 * 
 * @domain Entité principale du module Notification
 * @responsibilities Représenter une notification dans le système
 * ============================================================================
 */

/**
 * Type de notification disponible dans le système
 * 
 * Ces types couvrent tous les événements qui peuvent déclencher une notification :
 * - Compte utilisateur : création, validation, rejet
 * - Missions : création, acceptation, refus, termination, annulation
 * - Paiements : réception, libération, remboursement
 * - Disputes : ouverture, mise à jour, résolution
 * - Reviews : nouvel avis reçu
 * - Système : notifications système générales
 */
export enum NotificationType {
  // === COMPTE UTILISATEUR ===
  
  /** Notification lors de la création d'un compte */
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  
  /** Notification lorsqu'un compte worker est en attente de validation */
  ACCOUNT_PENDING_APPROVAL = 'ACCOUNT_PENDING_APPROVAL',
  
  /** Notification lorsqu'un compte a été validé par un administrateur */
  ACCOUNT_APPROVED = 'ACCOUNT_APPROVED',
  
  /** Notification lorsqu'un compte a été rejeté */
  ACCOUNT_REJECTED = 'ACCOUNT_REJECTED',
  
  // === MISSIONS ===
  
  /** Notification lorsqu'une nouvelle mission est créée */
  MISSION_CREATED = 'MISSION_CREATED',
  
  /** Notification lorsqu'une mission a été acceptée par un worker */
  MISSION_ACCEPTED = 'MISSION_ACCEPTED',
  
  /** Notification lorsqu'une mission a été refusée par un worker */
  MISSION_REFUSED = 'MISSION_REFUSED',
  
  /** Notification lorsqu'une mission est terminée */
  MISSION_COMPLETED = 'MISSION_COMPLETED',
  
  /** Notification lorsqu'une mission est annulée */
  MISSION_CANCELLED = 'MISSION_CANCELLED',
  
  // === PAIEMENTS ===
  
  /** Notification lorsqu'un paiement a été reçu */
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  
  /** Notification lorsqu'un paiement a été libéré (au worker) */
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  
  /** Notification lorsqu'un paiement a été remboursé */
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  
  // === DISPUTES ===
  
  /** Notification lorsqu'une dispute est ouverte */
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  
  /** Notification lors d'une mise à jour du statut d'une dispute */
  DISPUTE_STATUS_UPDATED = 'DISPUTE_STATUS_UPDATED',
  
  /** Notification lorsqu'une dispute est résolue */
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  
  // === REVIEWS ===
  
  /** Notification lorsqu'un nouvel avis est reçu */
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  
  // === SYSTÈME ===
  
  /** Notification système générale */
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
}

/**
 * Statut de lecture de la notification
 * 
 * Permet de suivre si l'utilisateur a lu ou non la notification.
 * Utile pour l'interface utilisateur (affichage du badge de notifications non lues).
 */
export enum NotificationStatus {
  /** Notification non lue par l'utilisateur */
  UNREAD = 'UNREAD',
  
  /** Notification lue par l'utilisateur */
  READ = 'READ',
}

/**
 * Entité Notification - Représentation domain d'une notification
 * 
 * Cette interface définit la structure d'une notification dans le domain model.
 * Elle est utilisée dans toute l'application pour représenter les notifications.
 */
export interface NotificationEntity {
  /** Identifiant unique de la notification */
  id: string;
  
  /** Identifiant de l'utilisateur destinataire de la notification */
  userId: string;
  
  /** Type de notification (détermine le type d'événement) */
  type: NotificationType;
  
  /** Titre de la notification (affiché dans l'interface) */
  title: string;
  
  /** Corps du message de la notification */
  message: string;
  
  /** Statut de lecture (lu ou non lu) */
  status: NotificationStatus;
  
  /** Date de lecture de la notification (null si non lue) */
  readAt: Date | null;
  
  /** Identifiant de l'entité associée (mission, payment, dispute, etc.) */
  relatedId: string | null;
  
  /** Type de l'entité associée (mission, payment, dispute, review) */
  relatedType: string | null;
  
  /** Indique si une notification push a été envoyée (pour future intégration) */
  pushSent: boolean;
  
  /** Indique si un email a été envoyé (pour future intégration) */
  emailSent: boolean;
  
  /** Date de création de la notification */
  createdAt: Date;
  
  /** Date de dernière modification */
  updatedAt: Date;
}

/**
 * Type pour les données de création d'une notification
 * Utilisé lors de la création d'une nouvelle notification
 */
export interface CreateNotificationData {
  /** Identifiant de l'utilisateur destinataire */
  userId: string;
  
  /** Type de notification */
  type: NotificationType;
  
  /** Titre de la notification */
  title: string;
  
  /** Message de la notification */
  message: string;
  
  /** Identifiant de l'entité associée (optionnel) */
  relatedId?: string;
  
  /** Type de l'entité associée (optionnel) */
  relatedType?: string;
}

/**
 * Type pour les données de mise à jour d'une notification
 */
export interface UpdateNotificationData {
  /** Nouveau statut de lecture */
  status?: NotificationStatus;
  
  /** Date de lecture */
  readAt?: Date;
  
  /** Statut d'envoi push */
  pushSent?: boolean;
  
  /** Statut d'envoi email */
  emailSent?: boolean;
}
