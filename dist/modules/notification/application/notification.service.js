/**
 * ============================================================================
 * APPLICATION LAYER - Notification Service
 * ============================================================================
 * Service centralisé pour la gestion des notifications métier.
 *
 * Ce service encapsule CreateNotificationUseCase et fournit des méthodes
 * métier claires pour déclencher des notifications dans les workflows.
 *
 * Objectif: Éviter l'utilisation directe du UseCase dans les autres modules
 * et centraliser la logique de notification avec des messages en français.
 *
 * @responsabilities:
 * - Encapsuler la création de notifications
 * - Fournir des méthodes métier contextualisées
 * - Générer des messages clairs en français
 *
 * @SOLID - Single Responsibility: Responsabilité unique de service de notification
 * @SOLID - Dependency Inversion: Dépend d'abstractions (CreateNotificationUseCase)
 * ============================================================================
 */
import { NotificationType } from '../domain/notification.entity.js';
import { CreateNotificationUseCase } from './use-cases/index.js';
/**
 * Notification Service - Service centralisé de notifications
 *
 * Ce service fournit des méthodes métier pour chaque type d'événement
 * nécessitant une notification. Chaque méthode est contextualisée avec
 * les informations pertinentes pour générer un message clair.
 */
export class NotificationService {
    createNotificationUseCase;
    /**
     * Constructeur du service
     * @param createNotificationUseCase - UseCase pour créer les notifications
     */
    constructor(createNotificationUseCase) {
        this.createNotificationUseCase = createNotificationUseCase;
    }
    // ============================================================================
    // NOTIFICATIONS DE MISSION
    // ============================================================================
    /**
     * Notifie le client qu'un worker a accepté sa mission
     *
     * @param context - Contexte de la mission (clientId, workerName, missionId)
     */
    async notifyMissionAccepted(context) {
        const additionalData = {};
        if (context.workerName)
            additionalData.workerName = context.workerName;
        if (context.serviceTitle)
            additionalData.serviceTitle = context.serviceTitle;
        return this.createNotificationUseCase.createMissionNotification(context.clientId, NotificationType.MISSION_ACCEPTED, context.missionId, Object.keys(additionalData).length > 0 ? additionalData : undefined);
    }
    /**
     * Notifie le client qu'un worker a refusé sa mission
     *
     * @param context - Contexte de la mission (clientId, workerName, missionId)
     */
    async notifyMissionRefused(context) {
        const additionalData = {};
        if (context.workerName)
            additionalData.workerName = context.workerName;
        if (context.serviceTitle)
            additionalData.serviceTitle = context.serviceTitle;
        return this.createNotificationUseCase.createMissionNotification(context.clientId, NotificationType.MISSION_REFUSED, context.missionId, Object.keys(additionalData).length > 0 ? additionalData : undefined);
    }
    /**
     * Notifie le client que la mission est terminée
     *
     * @param context - Contexte de la mission (clientId, missionId)
     */
    async notifyMissionCompleted(context) {
        const additionalData = {};
        if (context.workerName)
            additionalData.workerName = context.workerName;
        return this.createNotificationUseCase.createMissionNotification(context.clientId, NotificationType.MISSION_COMPLETED, context.missionId, Object.keys(additionalData).length > 0 ? additionalData : undefined);
    }
    /**
     * Notifie les parties qu'une mission a été annulée
     *
     * @param context - Contexte de la mission
     */
    async notifyMissionCancelled(context) {
        const clientData = {};
        if (context.workerName)
            clientData.workerName = context.workerName;
        if (context.serviceTitle)
            clientData.serviceTitle = context.serviceTitle;
        const workerData = {};
        if (context.clientName)
            workerData.clientName = context.clientName;
        if (context.serviceTitle)
            workerData.serviceTitle = context.serviceTitle;
        // Notifier le client
        await this.createNotificationUseCase.createMissionNotification(context.clientId, NotificationType.MISSION_CANCELLED, context.missionId, Object.keys(clientData).length > 0 ? clientData : undefined);
        // Notifier le worker
        await this.createNotificationUseCase.createMissionNotification(context.workerId, NotificationType.MISSION_CANCELLED, context.missionId, Object.keys(workerData).length > 0 ? workerData : undefined);
    }
    // ============================================================================
    // NOTIFICATIONS DE REVIEW
    // ============================================================================
    /**
     * Notifie le worker qu'il a reçu un nouvel avis
     *
     * @param context - Contexte du review (workerId, missionId, rating, clientName)
     */
    async notifyReviewReceived(context) {
        return this.createNotificationUseCase.createReviewNotification(context.workerId, context.missionId, context.rating, context.clientName);
    }
    // ============================================================================
    // NOTIFICATIONS DE DISPUTE
    // ============================================================================
    /**
     * Notifie les parties qu'une dispute a été ouverte
     *
     * @param context - Contexte de la dispute
     */
    async notifyDisputeOpened(context) {
        const reporterData = {};
        if (context.reason)
            reporterData.reason = context.reason;
        const reportedData = {};
        if (context.reason)
            reportedData.reason = context.reason;
        // Notifier le reporter (celui qui a ouvert la dispute)
        await this.createNotificationUseCase.createDisputeNotification(context.reporterId, NotificationType.DISPUTE_OPENED, context.disputeId, Object.keys(reporterData).length > 0 ? reporterData : undefined);
        // Notifier le reported (l'autre partie)
        await this.createNotificationUseCase.createDisputeNotification(context.reportedUserId, NotificationType.DISPUTE_OPENED, context.disputeId, Object.keys(reportedData).length > 0 ? reportedData : undefined);
    }
    /**
     * Notifie les parties qu'une dispute a été résolue
     *
     * @param context - Contexte de la dispute résolue
     */
    async notifyDisputeResolved(context) {
        const reporterData = {};
        if (context.resolution)
            reporterData.resolution = context.resolution;
        const reportedData = {};
        if (context.resolution)
            reportedData.resolution = context.resolution;
        // Notifier le reporter
        await this.createNotificationUseCase.createDisputeNotification(context.reporterId, NotificationType.DISPUTE_RESOLVED, context.disputeId, Object.keys(reporterData).length > 0 ? reporterData : undefined);
        // Notifier le reported
        await this.createNotificationUseCase.createDisputeNotification(context.reportedUserId, NotificationType.DISPUTE_RESOLVED, context.disputeId, Object.keys(reportedData).length > 0 ? reportedData : undefined);
    }
    // ============================================================================
    // NOTIFICATIONS DE PAIEMENT
    // ============================================================================
    /**
     * Notifie le worker qu'un paiement a été libéré
     *
     * @param context - Contexte du paiement (userId, missionId, amount)
     */
    async notifyPaymentReleased(context) {
        const additionalData = {};
        if (context.amount)
            additionalData.amount = context.amount;
        return this.createNotificationUseCase.createPaymentNotification(context.userId, NotificationType.PAYMENT_RELEASED, context.paymentId, Object.keys(additionalData).length > 0 ? additionalData : undefined);
    }
    /**
     * Notifie le client qu'un paiement a été remboursé
     *
     * @param context - Contexte du paiement (userId, missionId, amount)
     */
    async notifyPaymentRefunded(context) {
        const additionalData = {};
        if (context.amount)
            additionalData.amount = context.amount;
        return this.createNotificationUseCase.createPaymentNotification(context.userId, NotificationType.PAYMENT_REFUNDED, context.paymentId, Object.keys(additionalData).length > 0 ? additionalData : undefined);
    }
    // ============================================================================
    // NOTIFICATIONS DE COMPTE / ADMIN
    // ============================================================================
    /**
     * Notifie un worker que son compte a été validé
     *
     * @param context - Contexte du compte (userId)
     */
    async notifyAccountValidated(context) {
        return this.createNotificationUseCase.createAccountNotification(context.userId, NotificationType.ACCOUNT_APPROVED);
    }
    /**
     * Notifie un worker que son compte a été rejeté
     *
     * @param context - Contexte du compte (userId, rejectionReason)
     */
    async notifyAccountRejected(context) {
        const additionalData = {};
        if (context.rejectionReason)
            additionalData.rejectionReason = context.rejectionReason;
        return this.createNotificationUseCase.createAccountNotification(context.userId, NotificationType.ACCOUNT_REJECTED, Object.keys(additionalData).length > 0 ? additionalData : undefined);
    }
    // ============================================================================
    // NOTIFICATIONS SYSTÈME
    // ============================================================================
    /**
     * Envoie une notification système générique
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param title - Titre de la notification
     * @param message - Message de la notification
     */
    async notifySystem(userId, title, message) {
        return this.createNotificationUseCase.createSystemNotification(userId, title, message);
    }
}
//# sourceMappingURL=notification.service.js.map