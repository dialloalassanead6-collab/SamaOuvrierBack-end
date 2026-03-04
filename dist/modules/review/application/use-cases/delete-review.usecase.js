/**
 * Delete Review Use Case
 * Allows admin to delete a review
 * Recalculates worker rating after deletion
 */
import { Role } from '@prisma/client';
// Custom error classes for domain-specific errors
export class ForbiddenError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'ForbiddenError';
    }
}
export class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
export class DeleteReviewUseCase {
    reviewRepository;
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async execute(dto) {
        const { reviewId, currentUserRole } = dto;
        // Business rule: Only admins can delete reviews
        if (currentUserRole !== Role.ADMIN) {
            return { success: false, error: 'Forbidden - Admin only' };
        }
        try {
            // Use transaction for atomicity
            const result = await this.reviewRepository.transaction(async () => {
                // 1. Find the review
                const review = await this.reviewRepository.findById(reviewId);
                if (!review) {
                    return { success: false, error: 'Review not found' };
                }
                const workerId = review.workerId;
                // 2. Delete the review
                await this.reviewRepository.delete(reviewId);
                // 3. Get remaining reviews for this worker
                const remainingReviews = await this.reviewRepository.findByWorkerId(workerId);
                // 4. Recalculate worker rating
                if (remainingReviews.length > 0) {
                    const totalRatings = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
                    const averageRating = totalRatings / remainingReviews.length;
                    await this.reviewRepository.updateWorkerRating(workerId, Math.round(averageRating * 100) / 100, remainingReviews.length);
                }
                else {
                    // No more reviews - reset rating
                    await this.reviewRepository.updateWorkerRating(workerId, 0, 0);
                }
                // 5. Reset mission reviewStatus to PENDING (optional - depends on business rules)
                // For now, we'll leave it as is since the review was deleted by admin
                return { success: true };
            });
            return result;
        }
        catch (error) {
            console.error('DeleteReviewUseCase error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete review',
            };
        }
    }
}
//# sourceMappingURL=delete-review.usecase.js.map