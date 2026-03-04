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
import { PrismaClient, NotificationStatus, NotificationType } from '@prisma/client';
import { prisma } from '../../../shared/database/index.js';
/**
 * Implémentation du repository de notification avec Prisma
 *
 * Cette classe implémente l'interface INotificationRepository et fournit
 * toutes les méthodes nécessaires pour manipuler les notifications dans la BDD.
 */
export class PrismaNotificationRepository {
    prisma;
    constructor(prismaClient) {
        // CRITICAL: Use injected Prisma singleton to avoid multiple connections
        this.prisma = prismaClient ?? prisma;
    }
    /**
     * Transforme un enregistrement Prisma en entité domain
     *
     * @param notification - L'enregistrement Prisma
     * @returns L'entité domain correspondante
     */
    toEntity(notification) {
        return {
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            status: notification.status,
            readAt: notification.readAt,
            relatedId: notification.relatedId,
            relatedType: notification.relatedType,
            pushSent: notification.pushSent,
            emailSent: notification.emailSent,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
    /**
     * Crée une nouvelle notification dans le système
     *
     * @param input - Les données de la notification à créer
     * @returns La notification créée
     */
    async create(input) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: input.userId,
                type: input.type,
                title: input.title,
                message: input.message,
                relatedId: input.relatedId || null,
                relatedType: input.relatedType || null,
                status: NotificationStatus.UNREAD,
                pushSent: false,
                emailSent: false,
            },
        });
        return this.toEntity(notification);
    }
    /**
     * Recherche une notification par son identifiant unique
     *
     * @param id - Identifiant de la notification
     * @returns La notification si elle existe, null sinon
     */
    async findById(id) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        return notification ? this.toEntity(notification) : null;
    }
    /**
     * Recherche les notifications d'un utilisateur avec filtres et pagination
     *
     * @param userId - Identifiant de l'utilisateur
     * @param filters - Filtres optionnels (statut, type, dates)
     * @param skip - Nombre d'éléments à ignorer
     * @param limit - Nombre maximum d'éléments à retourner
     * @returns Les notifications paginées
     */
    async findByUserId(userId, filters, skip, limit) {
        // Construction de la clause WHERE
        const where = {
            userId: userId,
        };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }
        // Exécution parallèle de la requête et du count
        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return {
            data: data.map((n) => this.toEntity(n)),
            total,
            page: Math.floor(skip / limit) + 1,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Compte les notifications non lues d'un utilisateur
     *
     * @param userId - Identifiant de l'utilisateur
     * @returns Le nombre de notifications non lues
     */
    async countUnreadByUserId(userId) {
        return this.prisma.notification.count({
            where: {
                userId: userId,
                status: NotificationStatus.UNREAD,
            },
        });
    }
    /**
     * Marque une notification comme lue
     *
     * @param id - Identifiant de la notification
     * @returns La notification mise à jour
     */
    async markAsRead(id) {
        const notification = await this.prisma.notification.update({
            where: { id },
            data: {
                status: NotificationStatus.READ,
                readAt: new Date(),
            },
        });
        return this.toEntity(notification);
    }
    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     *
     * @param userId - Identifiant de l'utilisateur
     * @returns Le nombre de notifications marquées comme lues
     */
    async markAllAsRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId: userId,
                status: NotificationStatus.UNREAD,
            },
            data: {
                status: NotificationStatus.READ,
                readAt: new Date(),
            },
        });
        return result.count;
    }
    /**
     * Supprime une notification
     *
     * @param id - Identifiant de la notification à supprimer
     */
    async delete(id) {
        await this.prisma.notification.delete({
            where: { id },
        });
    }
    /**
     * Supprime toutes les notifications d'un utilisateur
     *
     * @param userId - Identifiant de l'utilisateur
     * @returns Le nombre de notifications supprimées
     */
    async deleteAllByUserId(userId) {
        const result = await this.prisma.notification.deleteMany({
            where: { userId: userId },
        });
        return result.count;
    }
    /**
     * Met à jour le statut d'envoi push (pour future intégration)
     *
     * @param id - Identifiant de la notification
     * @param pushSent - Nouveau statut d'envoi push
     */
    async updatePushStatus(id, pushSent) {
        await this.prisma.notification.update({
            where: { id },
            data: { pushSent: pushSent },
        });
    }
    /**
     * Exécute une fonction dans une transaction
     * Utile pour les opérations qui nécessitent atomicité
     *
     * @param fn - Fonction à exécuter dans la transaction
     * @returns Le résultat de la fonction
     */
    async transaction(fn) {
        return this.prisma.$transaction(fn);
    }
}
/**
 * Instance singleton du repository de notification
 * À utiliser dans tout le Projet pour garantir une seule instance
 */
export const notificationRepository = new PrismaNotificationRepository(prisma);
//# sourceMappingURL=prisma-notification.repository.js.map