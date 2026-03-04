/**
 * ============================================================================
 * INTERFACE LAYER - Notification Routes
 * ============================================================================
 * Routes pour la gestion des notifications
 * 
 * @routes Endpoints API pour les notifications
 * ============================================================================
 */

import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { notificationRepository } from '../infrastructure/prisma-notification.repository.js';
import { CreateNotificationUseCase } from '../application/use-cases/create-notification.usecase.js';
import { authenticate, authorize, pagination } from '../../../shared/middleware/index.js';
import { validateRequest } from '../../../shared/middleware/index.js';
import { asyncHandler } from '../../../shared/utils/index.js';
import { Role } from '@prisma/client';
import {  
  notificationQuerySchema, 
  createNotificationSchema,
  notificationParamsSchema,
} from './notification.validation.js';

// Initialisation du use case et contrôleur
const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository);
const notificationController = new NotificationController(
  createNotificationUseCase,
  notificationRepository
);

/**
 * Router pour les notifications
 */
const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Liste des notifications de l'utilisateur
 *     description: >
 *       Récupère les notifications de l'utilisateur connecté avec pagination et filtres.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [UNREAD, READ]
 *         description: Filtrer par statut de lecture
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ACCOUNT_CREATED, ACCOUNT_APPROVED, MISSION_CREATED, MISSION_ACCEPTED, ...]
 *         description: Filtrer par type de notification
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des notifications
 *       401:
 *         description: Non authentifié
 */
router.get(
  '/',
  authenticate(),
  pagination(),
  validateRequest(notificationQuerySchema, 'query'),
  asyncHandler(notificationController.getNotifications.bind(notificationController))
);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Nombre de notifications non lues
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
 */
router.get(
  '/unread-count',
  authenticate(),
  asyncHandler(notificationController.getUnreadCount.bind(notificationController))
);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Créer une notification
 *     description: >
 *       Crée une nouvelle notification. Réservé aux administrateurs.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               relatedId:
 *                 type: string
 *               relatedType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification créée
 *       403:
 *         description: Accès refusé
 */
router.post(
  '/',
  authenticate(),
  authorize(Role.ADMIN),
  validateRequest(createNotificationSchema, 'body'),
  asyncHandler(notificationController.createNotification.bind(notificationController))
);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
router.patch(
  '/:id/read',
  authenticate(),
  validateRequest(notificationParamsSchema, 'params'),
  asyncHandler(notificationController.markAsRead.bind(notificationController))
);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 */
router.patch(
  '/read-all',
  authenticate(),
  asyncHandler(notificationController.markAllAsRead.bind(notificationController))
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     description: >
 *       Supprime une notification. Réservé aux administrateurs.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification supprimée
 *       403:
 *         description: Accès refusé
 */
router.delete(
  '/:id',
  authenticate(),
  authorize(Role.ADMIN),
  validateRequest(notificationParamsSchema, 'params'),
  asyncHandler(notificationController.deleteNotification.bind(notificationController))
);

/**
 * Factory function pour créer les routes de notification
 * @param controller - Contrôleur à utiliser
 * @returns Router Express configuré
 */
export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();
  
  // Routes avec le contrôleur passé en paramètre
  router.get(
    '/',
    authenticate(),
    pagination(),
    validateRequest(notificationQuerySchema, 'query'),
    asyncHandler(controller.getNotifications.bind(controller))
  );

  router.get(
    '/unread-count',
    authenticate(),
    asyncHandler(controller.getUnreadCount.bind(controller))
  );

  router.post(
    '/',
    authenticate(),
    authorize(Role.ADMIN),
    validateRequest(createNotificationSchema, 'body'),
    asyncHandler(controller.createNotification.bind(controller))
  );

  router.patch(
    '/:id/read',
    authenticate(),
    validateRequest(notificationParamsSchema, 'params'),
    asyncHandler(controller.markAsRead.bind(controller))
  );

  router.patch(
    '/read-all',
    authenticate(),
    asyncHandler(controller.markAllAsRead.bind(controller))
  );

  router.delete(
    '/:id',
    authenticate(),
    authorize(Role.ADMIN),
    validateRequest(notificationParamsSchema, 'params'),
    asyncHandler(controller.deleteNotification.bind(controller))
  );

  return router;
}

export default router;
