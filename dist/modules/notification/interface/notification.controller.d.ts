/**
 * ============================================================================
 * INTERFACE LAYER - Notification Controller
 * ============================================================================
 * Contrôleur pour la gestion des notifications
 *
 * Ce contrôleur expose les endpoints API pour la gestion des notifications.
 * Il utilise le use case pour la création et le repository pour les autres opérations.
 *
 * @controller Gestion des requêtes HTTP pour les notifications
 * ============================================================================
 */
import type { Request, Response, NextFunction } from 'express';
import type { CreateNotificationUseCase } from '../application/use-cases/create-notification.usecase.js';
import type { INotificationRepository } from '../application/index.js';
/**
 * Contrôleur de notification
 * Gère les endpoints API pour la gestion des notifications
 */
export declare class NotificationController {
    private readonly createNotificationUseCase;
    private readonly notificationRepository;
    /**
     * Constructeur du contrôleur
     * @param createNotificationUseCase - Use case pour créer des notifications
     * @param notificationRepository - Repository pour les opérations CRUD
     */
    constructor(createNotificationUseCase: CreateNotificationUseCase, notificationRepository: INotificationRepository);
    /**
     * GET /api/notifications
     * Liste les notifications de l'utilisateur connecté
     *
     * @param req - Requête Express
     * @param res - Réponse Express
     * @param next - Fonction next d'Express
     */
    getNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/notifications/unread-count
     * Retourne le nombre de notifications non lues
     *
     * @param req - Requête Express
     * @param res - Réponse Express
     * @param next - Fonction next d'Express
     */
    getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/notifications
     * Crée une nouvelle notification (admin uniquement)
     *
     * @param req - Requête Express
     * @param res - Réponse Express
     * @param next - Fonction next d'Express
     */
    createNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/notifications/:id/read
     * Marque une notification comme lue
     *
     * @param req - Requête Express
     * @param res - Réponse Express
     * @param next - Fonction next d'Express
     */
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/notifications/read-all
     * Marque toutes les notifications comme lues
     *
     * @param req - Requête Express
     * @param res - Réponse Express
     * @param next - Fonction next d'Express
     */
    markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/notifications/:id
     * Supprime une notification (admin uniquement)
     *
     * @param req - Requête Express
     * @param res - Réponse Express
     * @param next - Fonction next d'Express
     */
    deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=notification.controller.d.ts.map