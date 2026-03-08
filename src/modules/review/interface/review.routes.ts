/**
 * Review Routes
 * Defines all review API endpoints
 */
import { Router } from 'express';
import type { ReviewController } from './review.controller.js';
import { validateRequest } from '../../../shared/middleware/index.js';
import { createReviewSchema, deleteReviewSchema, getWorkerReviewsSchema } from './review.validation.js';
import { authorize } from '../../../shared/middleware/index.js';
import { Role } from '@prisma/client';

export function createReviewRoutes(controller: ReviewController): Router {
  const router = Router();

  /**
   * @swagger
   * /reviews:
   *   post:
   *     summary: Creer un avis
   *     description: Cree un nouvel avis pour une mission terminee
   *     tags:
   *       - Reviews
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
   *               - rating
   *             properties:
   *               missionId:
   *                 type: string
   *                 format: uuid
   *                 description: ID de la mission terminee
   *               rating:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 5
   *                 description: Note de 1 a 5
   *               comment:
   *                 type: string
   *                 description: Commentaire optionnel
   *     responses:
   *       201:
   *         description: Avis cree
   *       400:
   *         description: Erreur de validation
   *       401:
   *         description: Non authentifie
   */
  router.post(
    '/',
    validateRequest(createReviewSchema, 'body'),
    controller.createReview.bind(controller)
  );

  /**
   * @swagger
   * /reviews/workers/{workerId}/reviews:
   *   get:
   *     summary: Liste des avis d'un worker
   *     description: Retourne tous les avis d'un worker
   *     tags:
   *       - Reviews
   *     parameters:
   *       - in: path
   *         name: workerId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID du worker
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: Liste des avis
   */
  router.get(
    '/workers/:workerId/reviews',
    validateRequest(getWorkerReviewsSchema, 'params'),
    controller.getWorkerReviews.bind(controller)
  );

  /**
   * @swagger
   * /reviews/{id}:
   *   delete:
   *     summary: Supprimer un avis
   *     description: Supprime un avis (admin uniquement)
   *     tags:
   *       - Reviews
   *       - Admin
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID de l'avis a supprimer
   *     responses:
   *       200:
   *         description: Avis supprime
   *       401:
   *         description: Non authentifie
   *       403:
   *         description: Acces refuse (admin uniquement)
   *       404:
   *         description: Avis introuvable
   */
  router.delete(
    '/:id',
    authorize(Role.ADMIN),
    validateRequest(deleteReviewSchema, 'params'),
    controller.deleteReview.bind(controller)
  );

  return router;
}
