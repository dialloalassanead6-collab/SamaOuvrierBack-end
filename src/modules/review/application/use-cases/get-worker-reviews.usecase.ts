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

export class GetWorkerReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(dto: GetWorkerReviewsDTO): Promise<GetWorkerReviewsResult> {
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
      
      const result = await this.reviewRepository.findAllEnriched(
        { workerId },
        skip,
        limit
      );

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
    } catch (error) {
      console.error('GetWorkerReviewsUseCase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews',
      };
    }
  }
}
