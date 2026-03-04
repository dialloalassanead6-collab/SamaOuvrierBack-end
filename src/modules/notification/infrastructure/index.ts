/**
 * ============================================================================
 * INFRASTRUCTURE LAYER - Index
 * ============================================================================
 * Point d'export pour la couche Infrastructure du module Notification
 * ============================================================================
 */

export { PrismaNotificationRepository, notificationRepository } from './prisma-notification.repository.js';

// Import necessary modules for NotificationService singleton
import { notificationRepository } from './prisma-notification.repository.js';
import { CreateNotificationUseCase } from '../application/use-cases/create-notification.usecase.js';
import { NotificationService } from '../application/notification.service.js';

// Create singleton instances
const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository);
export const notificationService = new NotificationService(createNotificationUseCase);
