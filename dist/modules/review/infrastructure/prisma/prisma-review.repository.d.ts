/**
 * Prisma Review Repository - Infrastructure Layer
 * Implementation of IReviewRepository using Prisma
 */
import { PrismaClient } from '@prisma/client';
import type { IReviewRepository, CreateReviewInput, ReviewFilters, PaginatedResult, ReviewData, EnrichedReviewData, MissionData, DisputeData } from '../../application/review.repository.interface.js';
export declare class PrismaReviewRepository implements IReviewRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    create(input: CreateReviewInput): Promise<ReviewData>;
    findById(id: string): Promise<ReviewData | null>;
    findByMissionId(missionId: string): Promise<ReviewData | null>;
    findAll(filters: ReviewFilters, skip: number, limit: number): Promise<PaginatedResult<ReviewData>>;
    findAllEnriched(filters: ReviewFilters, skip: number, limit: number): Promise<PaginatedResult<EnrichedReviewData>>;
    findByWorkerId(workerId: string): Promise<ReviewData[]>;
    findByClientId(clientId: string): Promise<ReviewData[]>;
    delete(id: string): Promise<void>;
    findMissionById(missionId: string): Promise<MissionData | null>;
    updateMissionReviewStatus(missionId: string, status: string): Promise<void>;
    updateWorkerRating(workerId: string, averageRating: number, totalReviews: number): Promise<void>;
    findActiveDisputeByMission(missionId: string): Promise<DisputeData | null>;
    transaction<T>(fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=prisma-review.repository.d.ts.map