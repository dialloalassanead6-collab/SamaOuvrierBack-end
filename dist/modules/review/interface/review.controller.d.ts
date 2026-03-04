/**
 * Review Controller
 * Handles HTTP requests for review operations
 */
import type { Request, Response } from 'express';
import type { CreateReviewUseCase, GetWorkerReviewsUseCase, DeleteReviewUseCase } from '../application/index.js';
export declare class ReviewController {
    private readonly createReviewUseCase;
    private readonly getWorkerReviewsUseCase;
    private readonly deleteReviewUseCase;
    constructor(createReviewUseCase: CreateReviewUseCase, getWorkerReviewsUseCase: GetWorkerReviewsUseCase, deleteReviewUseCase: DeleteReviewUseCase);
    /**
     * POST /api/reviews
     * Create a new review for a completed mission
     */
    createReview(req: Request, res: Response): Promise<void>;
    /**
     * GET /api/workers/:workerId/reviews
     * Get all reviews for a worker
     */
    getWorkerReviews(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /api/reviews/:id
     * Delete a review (admin only)
     */
    deleteReview(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=review.controller.d.ts.map