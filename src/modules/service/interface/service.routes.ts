// Routes - Service Routes
// Clean Architecture - Routes Layer

import { Router } from 'express';
import { serviceController } from './service.controller.js';
import { authenticate, authorize, pagination } from '../../../shared/middleware/index.js';
import { Role } from '@prisma/client';

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Creer un nouveau service
 *     description: Cree un nouveau service propose par un worker
 *     tags:
 *       - Services
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceRequest'
 *           example:
 *             title: "Installation plomberie"
 *             description: "Installation complete de plomberie pour maison"
 *             minPrice: 50000
 *             maxPrice: 500000
 *     responses:
 *       201:
 *         description: Service cree
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (reserve aux workers)
 * 
 *   get:
 *     summary: Liste des services
 *     description: Recupere la liste des services avec pagination obligatoire
 *     tags:
 *       - Services
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero de page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'elements par page
 *       - in: query
 *         name: workerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par worker (optionnel)
 *     responses:
 *       200:
 *         description: Liste des services
 *       401:
 *         description: Non authentifie (ne devrait pas arriver pour routes publiques)
 *
 * /services/{id}:
 *   get:
 *     summary: Obtenir un service par ID
 *     description: Recupere les details d'un service par son ID
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Service trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       401:
 *         description: Non authentifie (ne devrait pas arriver pour routes publiques)
 *       404:
 *         description: Service introuvable
 * 
 *   put:
 *     summary: Modifier un service
 *     description: Met a jour les informations d'un service (proprietaire ou admin uniquement)
 *     tags:
 *       - Services
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceRequest'
 *     responses:
 *       200:
 *         description: Service mis a jour
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (pas le proprietaire ni admin)
 *       404:
 *         description: Service introuvable
 * 
 *   delete:
 *     summary: Supprimer un service
 *     description: Supprime un service (proprietaire ou admin uniquement)
 *     tags:
 *       - Services
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Service supprime
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (pas le proprietaire ni admin)
 *       404:
 *         description: Service introuvable
 */

const router = Router();

// =============================================================================
// PUBLIC ROUTES (No authentication required)
// =============================================================================

// GET /services - Get all services (PUBLIC - with pagination)
router.get('/', pagination(), (req, res, next) => serviceController.getAll(req, res, next));

// GET /services/:id - Get service by ID (PUBLIC)
router.get('/:id', (req, res, next) => serviceController.getById(req, res, next));

// =============================================================================
// PROTECTED ROUTES (Authentication + Authorization required)
// =============================================================================

// POST /services - Create a new service
// Access: WORKER only (authenticated)
router.post(
  '/',
  authenticate(),
  authorize(Role.WORKER, Role.ADMIN),
  (req, res, next) => serviceController.create(req, res, next)
);

// PUT /services/:id - Update service
// Access: WORKER (own services only) or ADMIN (any service)
// Note: Ownership check is done in the UseCase
router.put(
  '/:id',
  authenticate(),
  authorize(Role.WORKER, Role.ADMIN),
  (req, res, next) => serviceController.update(req, res, next)
);

// DELETE /services/:id - Delete service
// Access: WORKER (own services only) or ADMIN (any service)
// Note: Ownership check is done in the UseCase
router.delete(
  '/:id',
  authenticate(),
  authorize(Role.WORKER, Role.ADMIN),
  (req, res, next) => serviceController.delete(req, res, next)
);

export default router;
