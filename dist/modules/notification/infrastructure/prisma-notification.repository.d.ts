/**
 * ============================================================================
 * INFRASTRUCTURE LAYER - Prisma Notification Repository
 * ============================================================================
 * Implémentation du repository de notification avec Prisma
 *
 * Cette implémentation utilise le singleton Prisma pour toutes les interactions
 * avec la base de données, conformément aux bonnes pratiques du projet.
 *
 * @infrastructure Implémentation Prisma de INotificationRepository
 * @responsabilities Gérer la persistence des notifications via Prisma
 * ============================================================================
 */
import { PrismaClient } from '@prisma/client';
import type { NotificationEntity } from '../domain/index.js';
import type { INotificationRepository, CreateNotificationInput, NotificationFilters, PaginatedNotifications } from '../application/index.js';
/**
 * Implémentation du repository de notification avec Prisma
 *
 * Cette classe implémente l'interface INotificationRepository et fournit
 * toutes les méthodes nécessaires pour manipuler les notifications dans la BDD.
 */
export declare class PrismaNotificationRepository implements INotificationRepository {
    private readonly prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * Transforme un enregistrement Prisma en entité domain
     *
     * @param notification - L'enregistrement Prisma
     * @returns L'entité domain correspondante
     */
    private toEntity;
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
     * @param filters - Filtres optionnels (statut, type, dates)
     * @param skip - Nombre d'éléments à ignorer
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
/**
 * Instance singleton du repository de notification
 * À utiliser dans tout le Projet pour garantir une seule instance
 */
export declare const notificationRepository: PrismaNotificationRepository;
//# sourceMappingURL=prisma-notification.repository.d.ts.map