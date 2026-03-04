/**
 * ============================================================================
 * NOTIFICATION MODULE - Main Index
 * ============================================================================
 * Point d'entrée principal pour le module de notifications
 *
 * Ce module gère toutes les notifications in-app pour l'application SamaOuvrier.
 * Il suit la Clean Architecture avec les couches suivantes :
 * - Domain : Entités et types
 * - Application : Use cases et interfaces de repository
 * - Infrastructure : Implémentation Prisma
 * - Interface : Contrôleurs, routes et validation
 *
 * @module Notification
 * @description Module de notifications pour l'application
 * ============================================================================
 */
export { CreateNotificationUseCase } from './application/index.js';
export { NotificationService, } from './application/index.js';
// Infrastructure Layer
export { PrismaNotificationRepository, notificationRepository, notificationService } from './infrastructure/index.js';
// Interface Layer
export { NotificationController, notificationRoutes, createNotificationRoutes } from './interface/index.js';
export { notificationQuerySchema, createNotificationSchema, notificationParamsSchema } from './interface/index.js';
//# sourceMappingURL=index.js.map