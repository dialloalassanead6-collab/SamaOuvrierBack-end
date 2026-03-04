// ============================================================================
// DASHBOARD ROUTES - Interface Layer
// ============================================================================
// Routes pour le dashboard admin
// Protégées par authentication et autorisation ADMIN
// ============================================================================
import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate, authorize } from '../../../shared/middleware/index.js';
import { Role } from '@prisma/client';
/**
 * Crée les routes du dashboard
 */
export function createDashboardRoutes(controller) {
    const router = Router();
    /**
     * @swagger
     * /dashboard/admin:
     *   get:
     *     summary: Statistiques du dashboard admin
     *     description: >
     *       Récupère les statistiques complètes du dashboard pour l'administrateur.
     *       Inclut les statistiques utilisateurs, missions, paiements et litiges.
     *       Réservé aux administrateurs uniquement.
     *     tags:
     *       - Dashboard
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: period
     *         schema:
     *           type: string
     *           enum: [7d, 30d, 90d, 1y]
     *         description: Période prédéfinie
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Date de début (YYYY-MM-DD)
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Date de fin (YYYY-MM-DD)
     *     responses:
     *       200:
     *         description: Statistiques du dashboard
     *       401:
     *         description: Non authentifié
     *       403:
     *         description: Accès refusé (pas admin)
     */
    router.get('/admin', authenticate(), authorize(Role.ADMIN), (req, res, next) => controller.getAdminDashboard(req, res).catch(next));
    /**
     * @swagger
     * /dashboard/worker:
     *   get:
     *     summary: Statistiques du dashboard worker
     *     description: >
     *       Récupère les statistiques du dashboard pour le worker connecté.
     *       Inclut les missions, revenus, réputation et litiges.
     *       Réservé aux workers uniquement.
     *     tags:
     *       - Dashboard
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Statistiques du dashboard worker
     *       401:
     *         description: Non authentifié
     *       403:
     *         description: Accès refusé (pas worker)
     */
    router.get('/worker', authenticate(), authorize(Role.WORKER), (req, res, next) => controller.getWorkerDashboard(req, res).catch(next));
    /**
     * @swagger
     * /dashboard/client:
     *   get:
     *     summary: Statistiques du dashboard client
     *     description: >
     *       Récupère les statistiques du dashboard pour le client connecté.
     *       Inclut les missions, dépenses, fiabilité et avis.
     *       Réservé aux clients uniquement.
     *       Le clientId est récupéré exclusivement depuis le token JWT (req.user.sub).
     *     tags:
     *       - Dashboard
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Statistiques du dashboard client
     *       401:
     *         description: Non authentifié
     *       403:
     *         description: Accès refusé (pas client)
     */
    router.get('/client', authenticate(), authorize(Role.CLIENT), (req, res, next) => controller.getClientDashboard(req, res).catch(next));
    return router;
}
//# sourceMappingURL=dashboard.routes.js.map