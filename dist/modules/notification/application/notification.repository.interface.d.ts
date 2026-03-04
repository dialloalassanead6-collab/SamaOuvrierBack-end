/**
 * ============================================================================
 * APPLICATION LAYER - Notification Repository Interface
 * ============================================================================
 * Ce fichier définit l'interface du repository pour les notifications.
 * Il suit le pattern Repository qui abstrait l'accès aux données.
 *
 * Cette interface est implémentée par la couche Infrastructure (Prisma).
 *
 * @responsabilities Définir les opérations CRUD pour les notifications
 * @ SOLID - Interface Segregation : Interface focalisée sur les notifications
 * @ SOLID - Dependency Inversion : Dépendance vers l'abstraction, pas l'implémentation
 * ============================================================================
 */
import type { NotificationEntity, NotificationStatus, NotificationType } from '../domain/notification.entity.js';
/**
 * Filtres pour la recherche de notifications
 * Permet de filtrer les notifications par statut, type et date
 */
export interface NotificationFilters {
    /** Filtrer par statut de lecture (lu/non lu) */
    status?: NotificationStatus;
    /** Filtrer par type de notification */
    type?: NotificationType;
    /** Filtrer à partir de cette date */
    startDate?: Date;
    /** Filtrer jusqu'à cette date */
    endDate?: Date;
}
/**
 * Paramètres de pagination pour les notifications
 */
export interface NotificationPaginationParams {
    /** Numéro de la page (commence à 1) */
    page: number;
    /** Nombre d'éléments par page */
    pageSize: number;
}
/**
 * Résultat paginé contenant les données et les métadonnées de pagination
 */
export interface PaginatedNotifications<T> {
    /** Les données de la page */
    data: T[];
    /** Nombre total d'éléments */
    total: number;
    /** Numéro de la page actuelle */
    page: number;
    /** Nombre d'éléments par page */
    pageSize: number;
    /** Nombre total de pages */
    totalPages: number;
}
/**
 * Input pour créer une nouvelle notification
 */
export interface CreateNotificationInput {
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
 * Interface du repository de notification
 *
 * Cette interface définit toutes les opérations nécessaires pour gérer
 * les notifications dans le système. Elle est implémentée par la
 * couche Infrastructure.
 */
export interface INotificationRepository {
    /**
     * Crée une nouvelle notification dans le système
     *
     * @param input - Les données de la notification à créer
     * @returns La notification créée
     */
    create(input: CreateNotificationInput): Promise<NotificationEntity>;
    /**
     * Recherche une notification par son identifiant unique
     *
     * @param id - Identifiant de la notification
     * @returns La notification si elle existe, null sinon
     */
    findById(id: string): Promise<NotificationEntity | null>;
    /**
     * Recherche les notifications d'un utilisateur avec filtres et pagination
     *
     * @param userId - Identifiant de l'utilisateur
     * @param filters - Filtresoptionnels (statut, type, dates)
     * @param skip - Nombre d'éléments à ignorer (pour la pagination)
     * @param limit - Nombre maximum d'éléments à retourner
     * @returns Les notifications paginées
     */
    findByUserId(userId: string, filters: NotificationFilters, skip: number, limit: number): Promise<PaginatedNotifications<NotificationEntity>>;
    /**
     * Compte les notifications non lues d'un utilisateur
     *
     * @param userId - Identifiant de l'utilisateur
     * @returns Le nombre de notifications non lues
     */
    countUnreadByUserId(userId: string): Promise<number>;
    /**
     * Marque une notification comme lue
     *
     * @param id - Identifiant de la notification
     * @returns La notification mise à jour
     */
    markAsRead(id: string): Promise<NotificationEntity>;
    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     *
     * @param userId - Identifiant de l'utilisateur
     * @returns Le nombre de notifications marquées comme lues
     */
    markAllAsRead(userId: string): Promise<number>;
    /**
     * Supprime une notification
     *
     * @param id - Identifiant de la notification à supprimer
     */
    delete(id: string): Promise<void>;
    /**
     * Supprime toutes les notifications d'un utilisateur
     *
     * @param userId - Identifiant de l'utilisateur
     * @returns Le nombre de notifications supprimées
     */
    deleteAllByUserId(userId: string): Promise<number>;
    /**
     * Met à jour le statut d'envoi push (pour future intégration)
     *
     * @param id - Identifiant de la notification
     * @param pushSent - Nouveau statut d'envoi push
     */
    updatePushStatus(id: string, pushSent: boolean): Promise<void>;
    /**
     * Exécute une fonction dans une transaction
     * Utile pour les opérations qui nécessitent atomicité
     *
     * @param fn - Fonction à exécuter dans la transaction
     * @returns Le résultat de la fonction
     */
    transaction<T>(fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=notification.repository.interface.d.ts.map