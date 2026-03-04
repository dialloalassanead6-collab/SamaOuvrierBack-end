/**
 * Create Review Use Case
 * Implements all business rules for creating a review
 * - Only client can review
 * - Only after mission is COMPLETED
 * - Only when reviewStatus is PENDING
 * - No active dispute allowed
 * - Uses transaction for atomicity
 * - Envoie une notification au worker
 */
import { MissionStatus, ReviewStatus, DisputeStatus } from '@prisma/client';
import type { IReviewRepository, CreateReviewInput, ReviewData } from '../review.repository.interface.js';
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

export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly notificationService: NotificationService
  ) {}

  async execute(dto: CreateReviewDTO): Promise<CreateReviewResult> {
    const { missionId, rating, comment, clientId } = dto;

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return {
        success: false,
        error: 'Rating must be an integer between 1 and 5',
      };
    }

    try {
      // Use transaction for atomicity
      const result = await this.reviewRepository.transaction(async () => {
        // 1. Check mission exists and get details
        const mission = await this.reviewRepository.findMissionById(missionId);
        
        if (!mission) {
          return { success: false, error: 'Mission not found' } as CreateReviewResult;
        }

        // 2. Check if user is the client of the mission
        if (mission.clientId !== clientId) {
          return { success: false, error: 'Only the client can review this mission' } as CreateReviewResult;
        }

        // 3. Check mission status is COMPLETED
        if (mission.status !== MissionStatus.COMPLETED) {
          return { success: false, error: 'Mission must be completed to leave a review' } as CreateReviewResult;
        }

        // 4. Check reviewStatus is PENDING
        if (mission.reviewStatus !== ReviewStatus.PENDING) {
          return { success: false, error: 'Review has already been submitted for this mission' } as CreateReviewResult;
        }

        // 5. Check no active dispute exists
        const activeDispute = await this.reviewRepository.findActiveDisputeByMission(missionId);
        
        if (activeDispute) {
          if (activeDispute.status === DisputeStatus.OPEN || activeDispute.status === DisputeStatus.UNDER_REVIEW) {
            return { success: false, error: 'Cannot review a mission with an active dispute' } as CreateReviewResult;
          }
        }

        // 6. Check no review already exists for this mission
        const existingReview = await this.reviewRepository.findByMissionId(missionId);
        
        if (existingReview) {
          return { success: false, error: 'A review already exists for this mission' } as CreateReviewResult;
        }

        // 7. Create the review
        const reviewInput: CreateReviewInput = {
          missionId,
          workerId: mission.workerId,
          clientId,
          rating,
          ...(comment && { comment }),
        };

        const review = await this.reviewRepository.create(reviewInput);

        // 8. Update mission reviewStatus to DONE
        await this.reviewRepository.updateMissionReviewStatus(missionId, ReviewStatus.DONE);

        // 9. Calculate new average rating for worker
        // Get all reviews for this worker
        const workerReviews = await this.reviewRepository.findByWorkerId(mission.workerId);
        
        const totalRatings = workerReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings / workerReviews.length;

        // 10. Update worker rating
        await this.reviewRepository.updateWorkerRating(
          mission.workerId,
          Math.round(averageRating * 100) / 100, // Round to 2 decimal places
          workerReviews.length
        );

        // 11. Notifier le worker du nouvel avis
        await this.notificationService.notifyReviewReceived({
          missionId: missionId,
          workerId: mission.workerId,
          clientName: clientId, // TODO: Récupérer le nom du client
          rating: rating,
        });

        return { success: true, review } as CreateReviewResult;
      });

      return result;
    } catch (error) {
      console.error('CreateReviewUseCase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create review',
      };
    }
  }
}
