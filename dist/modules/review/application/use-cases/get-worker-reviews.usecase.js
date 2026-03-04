export class GetWorkerReviewsUseCase {
    reviewRepository;
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async execute(dto) {
        const { workerId, page = 1, limit = 10 } = dto;
        // Validate pagination
        if (page < 1) {
            return { success: false, error: 'Page must be greater than 0' };
        }
        if (limit < 1 || limit > 100) {
            return { success: false, error: 'Limit must be between 1 and 100' };
        }
        try {
            const skip = (page - 1) * limit;
            const result = await this.reviewRepository.findAllEnriched({ workerId }, skip, limit);
            return {
                success: true,
                data: {
                    data: result.data,
                    total: result.total,
                    page,
                    limit,
                    totalPages: result.totalPages,
                },
            };
        }
        catch (error) {
            console.error('GetWorkerReviewsUseCase error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch reviews',
            };
        }
    }
}
//# sourceMappingURL=get-worker-reviews.usecase.js.map