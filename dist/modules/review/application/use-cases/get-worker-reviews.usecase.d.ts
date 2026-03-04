/**
 * Get Worker Reviews Use Case
 * Retrieves all reviews for a specific worker with pagination
 */
import type { IReviewRepository, EnrichedReviewData, PaginatedResult } from '../review.repository.interface.js';
export interface GetWorkerReviewsDTO {
    workerId: string;
    page?: number;
    limit?: number;
}
export interface GetWorkerReviewsResult {
    success: boolean;
    data?: PaginatedResult<EnrichedReviewData>;
    error?: string;
}
export declare class GetWorkerReviewsUseCase {
    private readonly reviewRepository;
    constructor(reviewRepository: IReviewRepository);
    execute(dto: GetWorkerReviewsDTO): Promise<GetWorkerReviewsResult>;
}
//# sourceMappingURL=get-worker-reviews.usecase.d.ts.map