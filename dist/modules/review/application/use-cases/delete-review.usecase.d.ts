/**
 * Delete Review Use Case
 * Allows admin to delete a review
 * Recalculates worker rating after deletion
 */
import { Role } from '@prisma/client';
import type { IReviewRepository } from '../review.repository.interface.js';
export declare class ForbiddenError extends Error {
    constructor(message?: string);
}
export declare class NotFoundError extends Error {
    constructor(message?: string);
}
export interface DeleteReviewDTO {
    reviewId: string;
    currentUserRole: Role;
}
export interface DeleteReviewResult {
    success: boolean;
    error?: string;
}
export declare class DeleteReviewUseCase {
    private readonly reviewRepository;
    constructor(reviewRepository: IReviewRepository);
    execute(dto: DeleteReviewDTO): Promise<DeleteReviewResult>;
}
//# sourceMappingURL=delete-review.usecase.d.ts.map