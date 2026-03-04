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
/**
 * Router pour les notifications
 */
declare const router: import("express-serve-static-core").Router;
/**
 * Factory function pour créer les routes de notification
 * @param controller - Contrôleur à utiliser
 * @returns Router Express configuré
 */
export declare function createNotificationRoutes(controller: NotificationController): Router;
export default router;
//# sourceMappingURL=notification.routes.d.ts.map