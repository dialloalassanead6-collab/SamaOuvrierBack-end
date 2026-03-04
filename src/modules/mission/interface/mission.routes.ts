// ============================================================================
// MISSION ROUTES - INTERFACE LAYER
// ============================================================================
// Définit les routes HTTP pour les endpoints des missions
// ============================================================================

import { Router } from 'express';
import { Role } from '@prisma/client';
import { missionController } from './mission.controller.js';
import { authenticate, pagination, verifyMissionOwnership, authorize } from '../../../shared/middleware/index.js';

/**
 * @swagger
 * /missions:
 *   post:
 *     summary: Créer une nouvelle mission
 *     description: Crée une nouvelle mission entre un client et un worker
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerId
 *               - serviceId
 *             properties:
 *               workerId:
 *                 type: string
 *                 description: ID du worker
 *               serviceId:
 *                 type: string
 *                 description: ID du service
 *     responses:
 *       201:
 *         description: Mission créée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 * 
 *   get:
 *     summary: Liste des missions
 *     description: Récupère la liste des missions avec pagination
 *     tags:
 *       - Missions
 *     parameters:
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filtrer par client
 *       - in: query
 *         name: workerId
 *         schema:
 *           type: string
 *         description: Filtrer par worker
 *       - in: query
 *         name: details
 *         schema:
 *           type: string
 *         description: Inclure les détails (true/false)
 *     responses:
 *       200:
 *         description: Liste des missions
 * 
 * /missions/{id}:
 *   get:
 *     summary: Récupérer une mission par ID
 *     description: Récupère les détails d'une mission
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Mission trouvée
 *       404:
 *         description: Mission introuvable
 * 
 * /missions/{id}/accept:
 *   post:
 *     summary: Accepter la mission
 *     description: Permet au worker d'accepter une mission en attente
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Mission acceptée
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Mission introuvable
 *
 * /missions/{id}/refuse:
 *   post:
 *     summary: Refuser la mission
 *     description: Permet au worker de refuser une mission en attente
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Mission refusée
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Mission introuvable
 *
 * /missions/{id}/confirm-initial-payment:
 *   post:
 *     summary: Confirmer le paiement initial
 *     description: Confirme le paiement initial et déverrouille les coordonnées
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Paiement initial confirmé
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Mission introuvable
 * 
 * /missions/{id}/set-final-price:
 *   post:
 *     summary: Fixer le prix final
 *     description: Fixe le prix final après négociation
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prixFinal
 *             properties:
 *               prixFinal:
 *                 type: number
 *                 description: Prix final convenu
 *     responses:
 *       200:
 *         description: Prix final fixé
 *       400:
 *         description: Erreur de validation
 * 
 * /missions/{id}/confirm-final-payment:
 *   post:
 *     summary: Confirmer le paiement final
 *     description: Confirme le paiement final et démarre la mission
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Paiement final confirmé
 *       400:
 *         description: Erreur de validation
 * 
 * /missions/{id}/complete:
 *   post:
 *     summary: Terminer la mission
 *     description: Marque la mission comme terminée
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Mission terminée
 *       400:
 *         description: Erreur de validation
 * 
 * /missions/{id}/request-cancellation:
 *   post:
 *     summary: Demander l'annulation
 *     description: Demande l'annulation d'une mission en cours
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Demande d'annulation soumise
 *       400:
 *         description: Erreur de validation
 * 
 * /missions/{id}/process-cancellation:
 *   post:
 *     summary: Traiter l'annulation
 *     description: Approuve ou rejette une demande d'annulation
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: true pour approuver, false pour rejeter
 *     responses:
 *       200:
 *         description: Annulation traitée
 *       400:
 *         description: Erreur de validation
 * 
 * /missions/{id}/cancel:
 *   post:
 *     summary: Annuler la mission
 *     description: Annule une mission (pour les statuts permettant une annulation directe)
 *     tags:
 *       - Missions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la mission
 *     responses:
 *       200:
 *         description: Mission annulée
 *       400:
 *         description: Erreur de validation
 */

const router = Router();

// POST /missions - Créer une mission (authentifié, client seulement)
router.post(
  '/',
  authenticate(),
  missionController.create
);

// GET /missions - Liste des missions (authentifié, filtré par rôle)
router.get(
  '/',
  authenticate(),
  pagination(),
  missionController.list
);

// GET /missions/:id - Récupérer une mission par ID (authentifié + ownership)
router.get(
  '/:id',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.getById
);

// POST /missions/:id/accept - Accepter la mission (authentifié)
router.post(
  '/:id/accept',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.accept
);

// POST /missions/:id/refuse - Refuser la mission (authentifié)
router.post(
  '/:id/refuse',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.refuse
);

// POST /missions/:id/confirm-initial-payment - Confirmer le paiement initial
router.post(
  '/:id/confirm-initial-payment',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.confirmInitialPayment
);

// POST /missions/:id/set-final-price - Fixer le prix final (authentifié + ownership)
router.post(
  '/:id/set-final-price',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.setFinalPrice
);

// POST /missions/:id/confirm-final-payment - Confirmer le paiement final
router.post(
  '/:id/confirm-final-payment',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.confirmFinalPayment
);

// POST /missions/:id/complete - Terminer la mission (authentifié + ownership)
router.post(
  '/:id/complete',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.complete
);

// POST /missions/:id/request-cancellation - Demander l'annulation (authentifié + ownership)
router.post(
  '/:id/request-cancellation',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.requestCancellation
);

// POST /missions/:id/process-cancellation - Traiter l'annulation (ADMIN uniquement)
router.post(
  '/:id/process-cancellation',
  authenticate(),
  authorize(Role.ADMIN),
  missionController.processCancellation
);

// POST /missions/:id/cancel - Annuler la mission (authentifié + ownership)
router.post(
  '/:id/cancel',
  authenticate(),
  verifyMissionOwnership({ requireOwnership: true }),
  missionController.cancel
);

export default router;
