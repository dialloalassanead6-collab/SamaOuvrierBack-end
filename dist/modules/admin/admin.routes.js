// ============================================================================
// ROUTES - Admin Routes
// ============================================================================
// Routes pour la gestion de la validation des travailleurs par l'admin
// ============================================================================
import { Router } from 'express';
import { adminController } from './interface/index.js';
import { authenticate, authorize, pagination } from '../../shared/middleware/index.js';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../shared/utils/index.js';
/**
 * Router admin
 */
const router = Router();
/**
 * @swagger
 * /admin/workers:
 *   get:
 *     summary: Liste des travailleurs
 *     description: >
 *       Récupère la liste des travailleurs avec un filtre optionnel par statut.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des travailleurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Statut du travailleur (optionnel)
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
 *           maximum: 100
 *         description: "Nombre d'éléments par page (max: 100)"
 *     responses:
 *       200:
 *         description: Liste des travailleurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     workers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 */
router.get('/workers', authenticate(), authorize(Role.ADMIN), pagination(), asyncHandler(adminController.listWorkers.bind(adminController)));
/**
 * @swagger
 * /admin/workers/{id}/approve:
 *   patch:
 *     summary: Approuver un travailleur
 *     description: >
 *       Approuve un travailleur en attente de validation.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des travailleurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du travailleur à approuver
 *     responses:
 *       200:
 *         description: Travailleur approuvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     worker:
 *                       $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Le travailleur n'est pas en attente
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Travailleur introuvable
 */
router.patch('/workers/:id/approve', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.approveWorker.bind(adminController)));
/**
 * @swagger
 * /admin/workers/{id}/reject:
 *   patch:
 *     summary: Rejeter un travailleur
 *     description: >
 *       Rejette un travailleur en attente de validation.
 *       La raison du rejet est obligatoire.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des travailleurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du travailleur à rejeter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 description: Raison du rejet
 *                 example: Profil incomplet. Veuillez fournir plus de détails sur vos compétences.
 *     responses:
 *       200:
 *         description: Travailleur rejeté
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     worker:
 *                       $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Raisons possibles - Le travailleur n'est pas en attente, ou raison du rejet manquante
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Travailleur introuvable
 */
router.patch('/workers/:id/reject', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.rejectWorker.bind(adminController)));
// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================
// Routes pour la gestion des utilisateurs par l'admin
// ============================================================================
/**
 * @swagger
 * /admin/users/{id}/activate:
 *   patch:
 *     summary: Activer un utilisateur
 *     description: >
 *       Active un utilisateur désactivé.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur à activer
 *     responses:
 *       200:
 *         description: Utilisateur activé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: L'utilisateur est déjà actif
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/users/:id/activate', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.activateUser.bind(adminController)));
/**
 * @swagger
 * /admin/users/{id}/deactivate:
 *   patch:
 *     summary: Désactiver un utilisateur
 *     description: >
 *       Désactive un utilisateur actif.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur à désactiver
 *     responses:
 *       200:
 *         description: Utilisateur désactivé
 *       400:
 *         description: L'utilisateur est déjà désactivé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/users/:id/deactivate', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.deactivateUser.bind(adminController)));
/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     summary: Bannir un utilisateur
 *     description: >
 *       Banni un utilisateur.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur à bannir
 *     responses:
 *       200:
 *         description: Utilisateur banni
 *       400:
 *         description: L'utilisateur est déjà banni
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/users/:id/ban', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.banUser.bind(adminController)));
/**
 * @swagger
 * /admin/users/{id}/unban:
 *   patch:
 *     summary: Débannir un utilisateur
 *     description: >
 *       Débanni un utilisateur banni.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur à débannir
 *     responses:
 *       200:
 *         description: Utilisateur débanni
 *       400:
 *         description: L'utilisateur n'est pas banni
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/users/:id/unban', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.unbanUser.bind(adminController)));
/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Soft delete un utilisateur
 *     description: >
 *       Soft delete un utilisateur (deletion logique).
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur à soft delete
 *     responses:
 *       200:
 *         description: Utilisateur soft deleted
 *       400:
 *         description: L'utilisateur est déjà soft deleted
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.delete('/users/:id', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.softDeleteUser.bind(adminController)));
/**
 * @swagger
 * /admin/users/{id}/restore:
 *   patch:
 *     summary: Restaurer un utilisateur soft deleted
 *     description: >
 *       Restaure un utilisateur soft deleted.
 *       Réservé aux administrateurs.
 *     tags:
 *       - Admin - Gestion des utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur à restaurer
 *     responses:
 *       200:
 *         description: Utilisateur restauré
 *       400:
 *         description: L'utilisateur n'est pas soft deleted
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (admin uniquement)
 *       404:
 *         description: Utilisateur introuvable
 */
router.patch('/users/:id/restore', authenticate(), authorize(Role.ADMIN), asyncHandler(adminController.restoreUser.bind(adminController)));
export default router;
//# sourceMappingURL=admin.routes.js.map