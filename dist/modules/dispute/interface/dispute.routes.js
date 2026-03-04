// ============================================================================
// DISPUTE ROUTES - Interface Layer
// ============================================================================
// Defines Express routes for dispute endpoints
// With hardened security and new endpoints
// ============================================================================
import { Router } from 'express';
import { DisputeController } from './dispute.controller.js';
import { PrismaDisputeRepository } from '../infrastructure/prisma/prisma-dispute.repository.js';
import { prisma } from '../../../shared/database/index.js';
import { authenticate, authorize } from '../../../shared/middleware/index.js';
import { Role } from '@prisma/client';
// Create router and instances
const router = Router();
const disputeRepository = new PrismaDisputeRepository(prisma);
const disputeController = new DisputeController(disputeRepository);
// ============================================================================
// PUBLIC ROUTES (Authenticated users)
// ============================================================================
/**
 * @swagger
 * /disputes:
 *   post:
 *     summary: Créer une nouvelle dispute
 *     description: Permet à un client ou worker d'ouvrir une dispute sur une mission
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - missionId
 *               - reason
 *               - description
 *             properties:
 *               missionId:
 *                 type: string
 *                 format: uuid
 *               reason:
 *                 type: string
 *                 enum: [PAYMENT_ISSUE, WORK_NOT_DONE, QUALITY_UNSATISFACTORY, NO_SHOW, CANCELLATION_ISSUE, COMMUNICATION_ISSUE, OTHER]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispute créée
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.post('/', authenticate, disputeController.getUploadMiddleware(), (req, res) => disputeController.createDispute(req, res));
/**
 * @swagger
 * /disputes:
 *   get:
 *     summary: Liste des disputes
 *     description: Récupère la liste des disputes avec pagination et filtres
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, OPEN, UNDER_REVIEW, RESOLVED, CLOSED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des disputes
 *       401:
 *         description: Non authentifié
 */
router.get('/', authenticate, (req, res) => disputeController.getDisputes(req, res));
// ============================================================================
// USER'S DISPUTES
// ============================================================================
/**
 * @swagger
 * /disputes/my:
 *   get:
 *     summary: Mes disputes
 *     description: Récupère les disputes de l'utilisateur connecté (en tant que reporter ou partie signalée)
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des disputes de l'utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get('/my', authenticate, (req, res) => disputeController.getMyDisputes(req, res));
// ============================================================================
// SINGLE DISPUTE
// ============================================================================
/**
 * @swagger
 * /disputes/{id}:
 *   get:
 *     summary: Détails d'une dispute
 *     description: Récupère les détails d'une dispute spécifique
 *     tags:
 *       - Disputes
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
 *         description: Détails de la dispute
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Dispute non trouvée
 */
router.get('/:id', authenticate, (req, res) => disputeController.getDisputeById(req, res));
// ============================================================================
// EVIDENCE MANAGEMENT
// ============================================================================
/**
 * @swagger
 * /disputes/{id}/evidence:
 *   post:
 *     summary: Ajouter une preuve
 *     description: Permet d'uploader une preuve (image, vidéo, document) pour une dispute
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Preuve ajoutée
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.post('/:id/evidence', authenticate, disputeController.getUploadMiddleware(), (req, res) => disputeController.addEvidence(req, res));
/**
 * @swagger
 * /disputes/{id}/evidences/{evidenceId}:
 *   delete:
 *     summary: Supprimer une preuve
 *     description: Permet de supprimer une preuve d'une dispute
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: evidenceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Preuve supprimée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Preuve non trouvée
 */
router.delete('/:id/evidences/:evidenceId', authenticate, (req, res) => disputeController.deleteEvidence(req, res));
// ============================================================================
// ADMIN ROUTES
// ============================================================================
/**
 * @swagger
 * /disputes/{id}/review:
 *   patch:
 *     summary: Mettre une dispute en examen
 *     description: Permet à un admin de mettre une dispute sous examen
 *     tags:
 *       - Disputes
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
 *         description: Dispute mise en examen
 *       403:
 *         description: Accès refusé (admin uniquement)
 */
router.patch('/:id/review', authenticate, authorize(Role.ADMIN), (req, res) => disputeController.reviewDispute(req, res));
/**
 * @swagger
 * /disputes/{id}/resolve:
 *   patch:
 *     summary: Résoudre une dispute
 *     description: Permet à un admin de résoudre une dispute
 *     tags:
 *       - Disputes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *                 enum: [CLIENT_WINS, WORKER_WINS, PARTIAL_REFUND, FULL_REFUND, NO_REFUND, DRAW]
 *               resolutionNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispute résolue
 *       403:
 *         description: Accès refusé (admin uniquement)
 */
router.patch('/:id/resolve', authenticate, authorize(Role.ADMIN), (req, res) => disputeController.resolveDispute(req, res));
// ============================================================================
// BACKWARD COMPATIBILITY - POST resolve (deprecated, use PATCH)
// ============================================================================
router.post('/:id/resolve', authenticate, authorize(Role.ADMIN), (req, res) => disputeController.resolveDispute(req, res));
export default router;
//# sourceMappingURL=dispute.routes.js.map