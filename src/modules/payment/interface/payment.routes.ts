// ============================================================================
// PAYMENT ROUTES - INTERFACE LAYER
// ============================================================================
// Définit les routes HTTP pour les paiements
// ============================================================================

import { Router } from 'express';
import { authenticate, verifyMissionOwnership } from '../../../shared/middleware/index.js';
import type { PaymentController } from './PaymentController.js';

/**
 * Crée les routes de paiement
 */
export function createPaymentRoutes(controller: PaymentController): Router {
  const router = Router();

  // ====================
  // ROUTES PUBLIQUES
  // ====================

  /**
   * @swagger
   * /payments/callback:
   *   post:
   *     summary: Webhook PayTech
   *     description: |
   *       Endpoint de callback pour les notifications de paiement PayTech (IPN).
   *       Verifie la signature et met a jour le statut du paiement.
   *     tags:
   *       - Payments
   *     parameters:
   *       - in: header
   *         name: x-paytech-signature
   *         required: true
   *         schema:
   *           type: string
   *         description: Signature HMAC-SHA256 du payload
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook traite
   *       400:
   *         description: Signature invalide
   */
  // Webhook PayTech (IPN) - Pas d'authentification requise
  router.post('/callback', controller.handleWebhook.bind(controller));

  // ====================
  // ROUTES PROTÉGÉES
  // ====================

  // Appliquer l'authentification
  router.use(authenticate());

  /**
   * @swagger
   * /payments:
   *   post:
   *     summary: Creer un paiement
   *     description: Cree un nouveau paiement pour une mission et retourne l'URL de paiement PayTech
   *     tags:
   *       - Payments
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
   *             properties:
   *               missionId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Paiement cree
   *       400:
   *         description: Erreur de validation
   *       401:
   *         description: Non authentifie
   */
  // Creer un paiement
  router.post('/', controller.createPayment.bind(controller));

  /**
   * @swagger
   * /payments/{missionId}/release:
   *   post:
   *     summary: Liberer l'escrow
   *     description: Libere les fonds en escrow apres double confirmation de completion
   *     tags:
   *       - Payments
   *       - Escrow
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: missionId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Escrow libere
   *       400:
   *         description: Erreur de validation
   *       401:
   *         description: Non authentifie
   */
  // Liberer l'escrow - necessite d'etre client ou worker de la mission
  router.post(
    '/:missionId/release',
    verifyMissionOwnership({ requireOwnership: true }),
    controller.releaseEscrow.bind(controller)
  );

  /**
   * @swagger
   * /payments/{missionId}/cancel:
   *   post:
   *     summary: Annuler le paiement
   *     description: Annule un paiement en attente
   *     tags:
   *       - Payments
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: missionId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Paiement annule
   *       400:
   *         description: Erreur de validation
   *       401:
   *         description: Non authentifie
   */
  // Annuler le paiement - necessite d'etre client ou worker de la mission
  router.post(
    '/:missionId/cancel',
    verifyMissionOwnership({ requireOwnership: true }),
    controller.cancelPayment.bind(controller)
  );

  /**
   * @swagger
   * /payments/{missionId}:
   *   get:
   *     summary: Obtenir le statut du paiement
   *     description: Retourne le statut du paiement et de l'escrow pour une mission
   *     tags:
   *       - Payments
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: missionId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Statut du paiement
   *       401:
   *         description: Non authentifie
   *       404:
   *         description: Mission introuvable
   */
  // Recuperer le statut du paiement - necessite d'etre client ou worker de la mission
  router.get(
    '/:missionId',
    verifyMissionOwnership({ requireOwnership: true }),
    controller.getPaymentStatus.bind(controller)
  );

  return router;
}
