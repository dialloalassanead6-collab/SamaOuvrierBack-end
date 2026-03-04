import type { IReviewRepository, ReviewData } from '../review.repository.interface.js';
import { NotificationService } from '../../../notification/index.js';
export interface CreateReviewDTO {
    missionId: string;
    rating: number;
    comment?: string;
    clientId: string;
}
export interface CreateReviewResult {
    success: boolean;
    review?: ReviewData;
    error?: string;
}
export declare class CreateReviewUseCase {
    private readonly reviewRepository;
    private readonly notificationService;
    constructor(reviewRepository: IReviewRepository, notificationService: NotificationService);
    execute(dto: CreateReviewDTO): Promise<CreateReviewResult>;
}
//# sourceMappingURL=create-review.usecase.d.ts.map