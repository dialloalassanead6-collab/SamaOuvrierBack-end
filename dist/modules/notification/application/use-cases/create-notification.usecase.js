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
/**
 * Messages prédéfinis pour chaque type de notification
 * Ces messages sont en français et clairs pour l'utilisateur
 */
const NOTIFICATION_MESSAGES = {
    // === COMPTE UTILISATEUR ===
    [NotificationType.ACCOUNT_CREATED]: {
        title: 'Compte créé',
        message: 'Votre compte a été créé avec succès. Bienvenue sur SamaOuvrier !',
    },
    [NotificationType.ACCOUNT_PENDING_APPROVAL]: {
        title: 'Validation en attente',
        message: 'Votre compte est en attente de validation par un administrateur. Vous recevrez une notification une fois validé.',
    },
    [NotificationType.ACCOUNT_APPROVED]: {
        title: 'Compte validé',
        message: 'Félicitations ! Votre compte a été validé par un administrateur. Vous pouvez maintenant utiliser tous les services de SamaOuvrier.',
    },
    [NotificationType.ACCOUNT_REJECTED]: {
        title: 'Compte rejeté',
        message: 'Votre demande de compte a été rejetée. Veuillez contacter le support pour plus d\'informations.',
    },
    // === MISSIONS ===
    [NotificationType.MISSION_CREATED]: {
        title: 'Nouvelle mission',
        message: 'Une nouvelle mission correspondant à vos compétences est disponible. Consultez-la dès maintenant !',
    },
    [NotificationType.MISSION_ACCEPTED]: {
        title: 'Mission acceptée',
        message: 'Le worker a accepté votre mission. Vous pouvez maintenant accéder à ses coordonnées.',
    },
    [NotificationType.MISSION_REFUSED]: {
        title: 'Mission refusée',
        message: 'Le worker a refusé cette mission. Veuillez sélectionner un autre worker ou créer une nouvelle mission.',
    },
    [NotificationType.MISSION_COMPLETED]: {
        title: 'Mission terminée',
        message: 'La mission est terminée. Merci de confirmer la réalisation et de laisser un avis au worker.',
    },
    [NotificationType.MISSION_CANCELLED]: {
        title: 'Mission annulée',
        message: 'La mission a été annulée. Si vous avez des questions, veuillez contacter le support.',
    },
    // === PAIEMENTS ===
    [NotificationType.PAYMENT_RECEIVED]: {
        title: 'Paiement reçu',
        message: 'Le paiement de la mission a été reçu. La mission va pouvoir démarrer.',
    },
    [NotificationType.PAYMENT_RELEASED]: {
        title: 'Paiement libéré',
        message: 'Le paiement pour la mission terminée a été libéré sur votre compte.',
    },
    [NotificationType.PAYMENT_REFUNDED]: {
        title: 'Paiement remboursé',
        message: 'Le paiement a été remboursé suite à l\'annulation de la mission.',
    },
    // === DISPUTES ===
    [NotificationType.DISPUTE_OPENED]: {
        title: 'Nouvelle dispute',
        message: 'Une dispute a été ouverte concernant une mission. Un administrateur va traiter votre demande.',
    },
    [NotificationType.DISPUTE_STATUS_UPDATED]: {
        title: 'Mise à jour de votre dispute',
        message: 'Le statut de votre dispute a été mis à jour. Consultez les détails pour plus d\'informations.',
    },
    [NotificationType.DISPUTE_RESOLVED]: {
        title: 'Dispute résolue',
        message: 'Votre dispute a été résolue. Consultez la décision de l\'administrateur dans les détails.',
    },
    // === REVIEWS ===
    [NotificationType.REVIEW_RECEIVED]: {
        title: 'Nouvel avis reçu',
        message: 'Un nouveau avis vous a été laissé. Merci pour votre travail !',
    },
    // === SYSTÈME ===
    [NotificationType.SYSTEM_NOTIFICATION]: {
        title: 'Notification système',
        message: 'Vous avez une nouvelle notification du système.',
    },
};
/**
 * Use Case pour créer des notifications
 *
 * Ce use case encapsule la logique de création de notifications
 * et fournit des méthodes helper pour les cas d'utilisation courants.
 */
export class CreateNotificationUseCase {
    notificationRepository;
    /**
     * Constructeur du use case
     * @param notificationRepository - Repository pour persister les notifications
     */
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    /**
     * Crée une notification générique
     *
     * @param input - Les données de la notification
     * @returns La notification créée
     * @throws Error si les données sont invalides
     */
    async execute(input) {
        // Validation des champs obligatoires
        this.validateInput(input);
        // Nettoyage des données
        const cleanInput = {
            userId: input.userId,
            type: input.type,
            title: input.title.trim(),
            message: input.message.trim(),
            ...(input.relatedId && { relatedId: input.relatedId }),
            ...(input.relatedType && { relatedType: input.relatedType }),
        };
        // Création de la notification via le repository
        return this.notificationRepository.create(cleanInput);
    }
    /**
     * Valide les données d'entrée
     * @param input - Les données à valider
     * @throws Error si les données sont invalides
     */
    validateInput(input) {
        if (!input.userId || input.userId.trim().length === 0) {
            throw new Error('L\'identifiant de l\'utilisateur est obligatoire');
        }
        if (!input.title || input.title.trim().length === 0) {
            throw new Error('Le titre de la notification est obligatoire');
        }
        if (input.title.trim().length > 200) {
            throw new Error('Le titre ne doit pas dépasser 200 caractères');
        }
        if (!input.message || input.message.trim().length === 0) {
            throw new Error('Le message de la notification est obligatoire');
        }
        if (input.message.trim().length > 2000) {
            throw new Error('Le message ne doit pas dépasser 2000 caractères');
        }
        if (!Object.values(NotificationType).includes(input.type)) {
            throw new Error('Le type de notification est invalide');
        }
    }
    /**
     * Récupère les messages pour un type de notification
     * @param type - Type de notification
     * @returns Les messages title et message
     */
    getMessages(type) {
        const messages = NOTIFICATION_MESSAGES[type];
        if (!messages) {
            return {
                title: 'Notification',
                message: 'Vous avez une nouvelle notification.',
            };
        }
        return messages;
    }
    /**
     * Crée une notification de compte utilisateur
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de compte
     * @param additionalData - Données supplémentaires (ex: reason du rejet)
     * @returns La notification créée
     */
    async createAccountNotification(userId, type, additionalData) {
        const messages = this.getMessages(type);
        let message = messages.message;
        // Personnalisation du message pour le rejet de compte
        if (type === NotificationType.ACCOUNT_REJECTED && additionalData?.rejectionReason) {
            message = `Votre demande de compte a été rejetée. Raison : ${additionalData.rejectionReason}. Veuillez contacter le support pour plus d'informations.`;
        }
        return this.execute({
            userId,
            type,
            title: messages.title,
            message,
        });
    }
    /**
     * Crée une notification de mission
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de mission
     * @param missionId - ID de la mission associée
     * @param additionalData - Données supplémentaires (nom du worker, etc.)
     * @returns La notification créée
     */
    async createMissionNotification(userId, type, missionId, additionalData) {
        const baseMessages = this.getMessages(type);
        let message = baseMessages.message;
        // Personnalisation du message selon le type
        switch (type) {
            case NotificationType.MISSION_ACCEPTED:
                if (additionalData?.workerName) {
                    message = `Le worker "${additionalData.workerName}" a accepté votre mission. Vous pouvez maintenant accéder à ses coordonnées.`;
                }
                break;
            case NotificationType.MISSION_REFUSED:
                if (additionalData?.workerName) {
                    message = `Le worker "${additionalData.workerName}" a refusé cette mission. Veuillez sélectionner un autre worker ou créer une nouvelle mission.`;
                }
                break;
            case NotificationType.MISSION_CREATED:
                if (additionalData?.serviceTitle) {
                    message = `Une nouvelle mission "${additionalData.serviceTitle}" correspondant à vos compétences est disponible. Consultez-la dès maintenant !`;
                }
                break;
            case NotificationType.MISSION_COMPLETED:
                message = 'La mission est terminée. Merci de confirmer la réalisation et de laisser un avis au worker.';
                break;
            case NotificationType.MISSION_CANCELLED:
                message = 'La mission a été annulée. Si vous avez des questions, veuillez contacter le support.';
                break;
        }
        return this.execute({
            userId,
            type,
            title: baseMessages.title,
            message,
            relatedId: missionId,
            relatedType: 'mission',
        });
    }
    /**
     * Crée une notification de dispute
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de dispute
     * @param disputeId - ID de la dispute associée
     * @param additionalData - Données supplémentaires (raison, résolution)
     * @returns La notification créée
     */
    async createDisputeNotification(userId, type, disputeId, additionalData) {
        const baseMessages = this.getMessages(type);
        let message = baseMessages.message;
        // Personnalisation du message
        if (type === NotificationType.DISPUTE_OPENED && additionalData?.reason) {
            message = `Une dispute a été ouverte : ${additionalData.reason}. Un administrateur va traiter votre demande.`;
        }
        else if (type === NotificationType.DISPUTE_RESOLVED && additionalData?.resolution) {
            message = `Votre dispute a été résolue. Décision : ${additionalData.resolution}.`;
        }
        return this.execute({
            userId,
            type,
            title: baseMessages.title,
            message,
            relatedId: disputeId,
            relatedType: 'dispute',
        });
    }
    /**
     * Crée une notification de review/avis
     *
     * @param userId - ID du worker destinataire
     * @param missionId - ID de la mission associée
     * @param rating - Note donnée (1-5)
     * @param reviewerName - Nom du client qui a laissé l'avis
     * @returns La notification créée
     */
    async createReviewNotification(userId, missionId, rating, reviewerName) {
        // Création des étoiles
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const message = reviewerName
            ? `${reviewerName} vous a laissé un avis : ${stars}`
            : `Un client vous a laissé un avis : ${stars}`;
        return this.execute({
            userId,
            type: NotificationType.REVIEW_RECEIVED,
            title: 'Nouvel avis reçu',
            message,
            relatedId: missionId,
            relatedType: 'mission',
        });
    }
    /**
     * Crée une notification de paiement
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param type - Type de notification de paiement
     * @param paymentId - ID du paiement associé
     * @param additionalData - Données supplémentaires (montant)
     * @returns La notification créée
     */
    async createPaymentNotification(userId, type, paymentId, additionalData) {
        const baseMessages = this.getMessages(type);
        let message = baseMessages.message;
        // Personnalisation du message avec le montant
        if (additionalData?.amount && (type === NotificationType.PAYMENT_RECEIVED || type === NotificationType.PAYMENT_RELEASED)) {
            message = `${baseMessages.message} Montant : ${additionalData.amount} XOF.`;
        }
        return this.execute({
            userId,
            type,
            title: baseMessages.title,
            message,
            relatedId: paymentId,
            relatedType: 'payment',
        });
    }
    /**
     * Crée une notification système
     *
     * @param userId - ID de l'utilisateur destinataire
     * @param title - Titre personnalisé
     * @param message - Message personnalisé
     * @returns La notification créée
     */
    async createSystemNotification(userId, title, message) {
        return this.execute({
            userId,
            type: NotificationType.SYSTEM_NOTIFICATION,
            title,
            message,
        });
    }
}
//# sourceMappingURL=create-notification.usecase.js.map