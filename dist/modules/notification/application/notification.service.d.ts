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
import type { NotificationEntity } from '../domain/notification.entity.js';
import { CreateNotificationUseCase } from './use-cases/index.js';
/**
 * Données de contexte pour les notifications de mission
 */
export interface MissionNotificationContext {
    missionId: string;
    clientId: string;
    workerId: string;
    workerName?: string;
    clientName?: string;
    serviceTitle?: string;
}
/**
 * Données de contexte pour les notifications de review
 */
export interface ReviewNotificationContext {
    missionId: string;
    workerId: string;
    clientName?: string;
    rating: number;
}
/**
 * Données de contexte pour les notifications de dispute
 */
export interface DisputeNotificationContext {
    disputeId: string;
    missionId: string;
    reporterId: string;
    reportedUserId: string;
    reason?: string;
    resolution?: string;
}
/**
 * Données de contexte pour les notifications de paiement
 */
export interface PaymentNotificationContext {
    paymentId: string;
    missionId: string;
    userId: string;
    amount?: string;
}
/**
 * Données de contexte pour les notifications de compte worker
 */
export interface AccountNotificationContext {
    userId: string;
    workerName?: string;
    rejectionReason?: string;
}
/**
 * Notification Service - Service centralisé de notifications
 *
 * Ce service fournit des méthodes métier pour chaque type d'événement
 * nécessitant une notification. Chaque méthode est contextualisée avec
 * les informations pertinentes pour générer un message clair.
 */
export declare class NotificationService {
    private readonly createNotificationUseCase;
    /**
     * Constructeur du service
     * @param createNotificationUseCase - UseCase pour créer les notifications
     */
    constructor(createNotificationUseCase: CreateNotificationUseCase);
    /**
     * Notifie le client qu'un worker a accepté sa mission
     *
     * @param context - Contexte de la mission (clientId, workerName, missionId)
     */
    notifyMissionAccepted(context: MissionNotificationContext): Promise<NotificationEntity>;
    /**
     * Notifie le client qu'un worker a refusé sa mission
     *
     * @param context - Contexte de la mission (clientId, workerName, missionId)
     */
    notifyMissionRefused(context: MissionNotificationContext): Promise<NotificationEntity>;
    /**
     * Notifie le client que la mission est terminée
     *
     * @param context - Contexte de la mission (clientId, missionId)
     */
    notifyMissionCompleted(context: MissionNotificationContext): Promise<NotificationEntity>;
    /**
     * Notifie les parties qu'une mission a été annulée
     *
     * @param context - Contexte de la mission
     */
    notifyMissionCancelled(context: MissionNotificationContext): Promise<void>;
    /**
     * Notifie le worker qu'il a reçu un nouvel avis
     *
     * @param context - Contexte du review (workerId, missionId, rating, clientName)
     */
    notifyReviewReceived(context: ReviewNotificationContext): Promise<NotificationEntity>;
    /**
     * Notifie les parties qu'une dispute a été ouverte
     *
     * @param context - Contexte de la dispute
     */
    notifyDisputeOpened(context: DisputeNotificationContext): Promise<void>;
    /**
     * Notifie les parties qu'une dispute a été résolue
     *
     * @param context - Contexte de la dispute résolue
     */
    notifyDisputeResolved(context: DisputeNotificationContext): Promise<void>;
    /**
     * Notifie le worker qu'un paiement a été libéré
     *
     * @param context - Contexte du paiement (userId, missionId, amount)
     */
    notifyPaymentReleased(context: PaymentNotificationContext): Promise<NotificationEntity>;
    /**
     * Notifie le client qu'un paiement a été remboursé
     *
     * @param context - Contexte du paiement (userId, missionId, amount)
     */
    notifyPaymentRefunded(context: PaymentNotificationContext): Promise<NotificationEntity>;
    /**
     * Notifie un worker que son compte a été validé
     *
     * @param context - Contexte du compte (userId)
     */
    notifyAccountValidated(context: AccountNotificationContext): Promise<NotificationEntity>;
    /**
     * Notifie un worker que son compte a été rejeté
     *
     * @param context - Contexte du compte (userId, rejectionReason)
     */
    notifyAccountRejected(context: AccountNotificationContext): Promise<NotificationEntity>;
    /**
     * Envoie une notification système générique
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param title - Titre de la notification
     * @param message - Message de la notification
     */
    notifySystem(userId: string, title: string, message: string): Promise<NotificationEntity>;
}
//# sourceMappingURL=notification.service.d.ts.map