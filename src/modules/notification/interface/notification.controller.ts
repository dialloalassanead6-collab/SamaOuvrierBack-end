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
import type { NotificationQueryParams, CreateNotificationBody, NotificationParams } from './notification.validation.js';
import type { CreateNotificationUseCase } from '../application/use-cases/create-notification.usecase.js';
import type { INotificationRepository } from '../application/index.js';
import { NotificationStatus, NotificationType } from '../domain/notification.entity.js';

/**
 * Contrôleur de notification
 * Gère les endpoints API pour la gestion des notifications
 */
export class NotificationController {
  /**
   * Constructeur du contrôleur
   * @param createNotificationUseCase - Use case pour créer des notifications
   * @param notificationRepository - Repository pour les opérations CRUD
   */
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly notificationRepository: INotificationRepository
  ) {}

  /**
   * GET /api/notifications
   * Liste les notifications de l'utilisateur connecté
   * 
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction next d'Express
   */
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Récupération de l'ID utilisateur depuis le token JWT
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
        return;
      }

      // Extraction et validation des paramètres de query
      const query = req.query as NotificationQueryParams;
      const page = parseInt(query.page || '1', 10);
      const pageSize = parseInt(query.pageSize || '10', 10);
      const skip = (page - 1) * pageSize;

      // Construction des filtres - on n'inclut que les propriétés définies pour éviter les erreurs avec exactOptionalPropertyTypes
      const filters: {
        status?: NotificationStatus;
        type?: NotificationType;
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (query.status) {
        filters.status = query.status as NotificationStatus;
      }
      if (query.type) {
        filters.type = query.type as NotificationType;
      }
      if (query.startDate) {
        filters.startDate = new Date(query.startDate);
      }
      if (query.endDate) {
        filters.endDate = new Date(query.endDate);
      }

      // Récupération des notifications
      const result = await this.notificationRepository.findByUserId(
        userId,
        filters,
        skip,
        pageSize
      );

      res.status(200).json({
        success: true,
        message: 'Notifications récupérées avec succès',
        data: {
          notifications: result.data,
          pagination: {
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Retourne le nombre de notifications non lues
   * 
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction next d'Express
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Récupération de l'ID utilisateur depuis le token JWT
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
        return;
      }

      // Comptage des notifications non lues
      const count = await this.notificationRepository.countUnreadByUserId(userId);

      res.status(200).json({
        success: true,
        message: 'Nombre de notifications non lues',
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications
   * Crée une nouvelle notification (admin uniquement)
   * 
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction next d'Express
   */
  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // La vérification du rôle admin est faite par le middleware authorize
      const body = req.body as CreateNotificationBody;

      // Création de la notification via le use case
      const notificationInput: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
        relatedType?: string;
      } = {
        userId: body.userId,
        type: body.type as NotificationType,
        title: body.title,
        message: body.message,
      };

      // Ajout conditionnel des propriétés optionnelles
      if (body.relatedId) {
        notificationInput.relatedId = body.relatedId;
      }
      if (body.relatedType) {
        notificationInput.relatedType = body.relatedType;
      }

      const notification = await this.createNotificationUseCase.execute(notificationInput);

      res.status(201).json({
        success: true,
        message: 'Notification créée avec succès',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Marque une notification comme lue
   * 
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction next d'Express
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Récupération de l'ID utilisateur depuis le token JWT
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
        return;
      }

      const { id } = req.params as NotificationParams;

      // Vérification que la notification existe
      const notification = await this.notificationRepository.findById(id);
      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification introuvable',
        });
        return;
      }

      // Vérification que la notification appartient à l'utilisateur
      if (notification.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Accès refusé',
        });
        return;
      }

      // Marquage comme lu
      const updated = await this.notificationRepository.markAsRead(id);

      res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue',
        data: { notification: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Marque toutes les notifications comme lues
   * 
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction next d'Express
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Récupération de l'ID utilisateur depuis le token JWT
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
        return;
      }

      // Marquage de toutes les notifications comme lues
      const count = await this.notificationRepository.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${count} notification(s) marquée(s) comme lue(s)`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Supprime une notification (admin uniquement)
   * 
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction next d'Express
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as NotificationParams;

      // Vérification que la notification existe
      const notification = await this.notificationRepository.findById(id);
      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification introuvable',
        });
        return;
      }

      // Suppression de la notification
      await this.notificationRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Notification supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
}
