export class ReviewController {
    createReviewUseCase;
    getWorkerReviewsUseCase;
    deleteReviewUseCase;
    constructor(createReviewUseCase, getWorkerReviewsUseCase, deleteReviewUseCase) {
        this.createReviewUseCase = createReviewUseCase;
        this.getWorkerReviewsUseCase = getWorkerReviewsUseCase;
        this.deleteReviewUseCase = deleteReviewUseCase;
    }
    /**
     * POST /api/reviews
     * Create a new review for a completed mission
     */
    async createReview(req, res) {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }
            const { missionId, rating, comment } = req.body;
            const result = await this.createReviewUseCase.execute({
                missionId,
                rating,
                comment,
                clientId: userId,
            });
            if (!result.success) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    error: result.error,
                });
                return;
            }
            res.status(201).json({
                success: true,
                data: result.review,
            });
        }
        catch (error) {
            console.error('ReviewController.createReview error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
    /**
     * GET /api/workers/:workerId/reviews
     * Get all reviews for a worker
     */
    async getWorkerReviews(req, res) {
        try {
            const { workerId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.getWorkerReviewsUseCase.execute({
                workerId,
                page,
                limit,
            });
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    error: result.error,
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: result.data,
            });
        }
        catch (error) {
            console.error('ReviewController.getWorkerReviews error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
    /**
     * DELETE /api/reviews/:id
     * Delete a review (admin only)
     */
    async deleteReview(req, res) {
        try {
            const userId = req.user?.sub;
            const userRole = req.user?.role;
            const { id } = req.params;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }
            // Pass userRole to use case for authorization (Clean Architecture)
            const result = await this.deleteReviewUseCase.execute({
                reviewId: id,
                currentUserRole: userRole,
            });
            if (!result.success) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    error: result.error,
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Review deleted successfully',
            });
        }
        catch (error) {
            console.error('ReviewController.deleteReview error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
}
//# sourceMappingURL=review.controller.js.map