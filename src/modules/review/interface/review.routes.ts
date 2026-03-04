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
   * POST /api/reviews
   * Create a new review for a completed mission
   * Protected: Authenticated clients only
   */
  router.post(
    '/',
    validateRequest(createReviewSchema, 'body'),
    controller.createReview.bind(controller)
  );

  /**
   * GET /api/workers/:workerId/reviews
   * Get all reviews for a worker
   * Public endpoint
   */
  router.get(
    '/workers/:workerId/reviews',
    validateRequest(getWorkerReviewsSchema, 'params'),
    controller.getWorkerReviews.bind(controller)
  );

  /**
   * DELETE /api/reviews/:id
   * Delete a review (admin only)
   * Protected: Admin only
   */
  router.delete(
    '/:id',
    authorize(Role.ADMIN),
    validateRequest(deleteReviewSchema, 'params'),
    controller.deleteReview.bind(controller)
  );

  return router;
}
