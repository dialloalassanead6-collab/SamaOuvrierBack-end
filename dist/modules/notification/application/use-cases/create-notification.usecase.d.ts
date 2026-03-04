/**
 * ============================================================================
 * APPLICATION LAYER - Create Notification Use Case
 * ============================================================================
 * Ce use case gère la création de notifications dans le système.
 *
 * Il fournit des méthodes helper pour créer des notifications pré-définies
 * selon le type d'événement (compte, mission, dispute, review, etc.)
 *
 * @responsabilities Gérer la création des notifications
 * @SOLID - Single Responsibility : Responsabilité unique de création de notifications
 * @SOLID - Open/Closed : Ouvert à l'extension (nouveaux types de notifications)
 * ============================================================================
 */
import { NotificationType } from '../../domain/notification.entity.js';
import type { NotificationEntity } from '../../domain/notification.entity.js';
import type { INotificationRepository, CreateNotificationInput } from '../notification.repository.interface.js';
/**
 * Données supplémentaires pour certains types de notifications
 */
export interface NotificationAdditionalData {
    rejectionReason?: string;
    workerName?: string;
    clientName?: string;
    serviceTitle?: string;
    reason?: string;
    resolution?: string;
    reviewerName?: string;
    rating?: number;
    amount?: string;
}
/**
 * Use Case pour créer des notifications
 *
 * Ce use case encapsule la logique de création de notifications
 * et fournit des méthodes helper pour les cas d'utilisation courants.
 */
export declare class CreateNotificationUseCase {
    private readonly notificationRepository;
    /**
     * Constructeur du use case
     * @param notificationRepository - Repository pour persister les notifications
     */
    constructor(notificationRepository: INotificationRepository);
    /**
     * Crée une notification générique
     *
     * @param input - Les données de la notification
     * @returns La notification créée
     * @throws Error si les données sont invalides
     */
    execute(input: CreateNotificationInput): Promise<NotificationEntity>;
    /**
     * Valide les données d'entrée
     * @param input - Les données à valider
     * @throws Error si les données sont invalides
     */
    private validateInput;
    /**
     * Récupère les messages pour un type de notification
     * @param type - Type de notification
     * @returns Les messages title et message
     */
    private getMessages;
    /**
     * Crée une notification de compte utilisateur
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de compte
     * @param additionalData - Données supplémentaires (ex: reason du rejet)
     * @returns La notification créée
     */
    createAccountNotification(userId: string, type: NotificationType.ACCOUNT_CREATED | NotificationType.ACCOUNT_PENDING_APPROVAL | NotificationType.ACCOUNT_APPROVED | NotificationType.ACCOUNT_REJECTED, additionalData?: NotificationAdditionalData): Promise<NotificationEntity>;
    /**
     * Crée une notification de mission
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de mission
     * @param missionId - ID de la mission associée
     * @param additionalData - Données supplémentaires (nom du worker, etc.)
     * @returns La notification créée
     */
    createMissionNotification(userId: string, type: NotificationType, missionId: string, additionalData?: NotificationAdditionalData): Promise<NotificationEntity>;
    /**
     * Crée une notification de dispute
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de dispute
     * @param disputeId - ID de la dispute associée
     * @param additionalData - Données supplémentaires (raison, résolution)
     * @returns La notification créée
     */
    createDisputeNotification(userId: string, type: NotificationType.DISPUTE_OPENED | NotificationType.DISPUTE_STATUS_UPDATED | NotificationType.DISPUTE_RESOLVED, disputeId: string, additionalData?: NotificationAdditionalData): Promise<NotificationEntity>;
    /**
     * Crée une notification de review/avis
     *
     * @param userId - ID du worker destinataire
     * @param missionId - ID de la mission associée
     * @param rating - Note donnée (1-5)
     * @param reviewerName - Nom du client qui a laissé l'avis
     * @returns La notification créée
     */
    createReviewNotification(userId: string, missionId: string, rating: number, reviewerName?: string): Promise<NotificationEntity>;
    /**
     * Crée une notification de paiement
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de paiement
     * @param paymentId - ID du paiement associé
     * @param additionalData - Données supplémentaires (montant)
     * @returns La notification créée
     */
    createPaymentNotification(userId: string, type: NotificationType.PAYMENT_RECEIVED | NotificationType.PAYMENT_RELEASED | NotificationType.PAYMENT_REFUNDED, paymentId: string, additionalData?: NotificationAdditionalData): Promise<NotificationEntity>;
    /**
     * Crée une notification système
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param title - Titre personnalisé
     * @param message - Message personnalisé
     * @returns La notification créée
     */
    createSystemNotification(userId: string, title: string, message: string): Promise<NotificationEntity>;
}
//# sourceMappingURL=create-notification.usecase.d.ts.map