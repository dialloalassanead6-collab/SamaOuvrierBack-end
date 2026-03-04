/**
 * Prisma Review Repository - Infrastructure Layer
 * Implementation of IReviewRepository using Prisma
 */
import { PrismaClient } from '@prisma/client';
import type { IReviewRepository, CreateReviewInput, ReviewFilters, PaginatedResult, ReviewData, EnrichedReviewData, MissionData, DisputeData } from '../../application/review.repository.interface.js';

export class PrismaReviewRepository implements IReviewRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(input: CreateReviewInput): Promise<ReviewData> {
    const review = await this.prisma.review.create({
      data: {
        missionId: input.missionId,
        workerId: input.workerId,
        clientId: input.clientId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
    });

    return {
      id: review.id,
      missionId: review.missionId,
      workerId: review.workerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  async findById(id: string): Promise<ReviewData | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) return null;

    return {
      id: review.id,
      missionId: review.missionId,
      workerId: review.workerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  async findByMissionId(missionId: string): Promise<ReviewData | null> {
    const review = await this.prisma.review.findUnique({
      where: { missionId },
    });

    if (!review) return null;

    return {
      id: review.id,
      missionId: review.missionId,
      workerId: review.workerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  async findAll(filters: ReviewFilters, skip: number, limit: number): Promise<PaginatedResult<ReviewData>> {
    const where: any = {};

    if (filters.workerId) {
      where.workerId = filters.workerId;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: data.map((review) => ({
        id: review.id,
        missionId: review.missionId,
        workerId: review.workerId,
        clientId: review.clientId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllEnriched(filters: ReviewFilters, skip: number, limit: number): Promise<PaginatedResult<EnrichedReviewData>> {
    const where: any = {};

    if (filters.workerId) {
      where.workerId = filters.workerId;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              prenom: true,
              nom: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const enrichedData: EnrichedReviewData[] = data.map((review) => ({
      id: review.id,
      missionId: review.missionId,
      workerId: review.workerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      client: {
        id: review.client.id,
        firstName: review.client.prenom,
        lastName: review.client.nom,
        // TODO: Add avatar field to User model and uncomment when available
        // avatar: review.client.avatar ?? null,
        avatar: null,
      },
    }));

    return {
      data: enrichedData,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByWorkerId(workerId: string): Promise<ReviewData[]> {
    const reviews = await this.prisma.review.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => ({
      id: review.id,
      missionId: review.missionId,
      workerId: review.workerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));
  }

  async findByClientId(clientId: string): Promise<ReviewData[]> {
    const reviews = await this.prisma.review.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => ({
      id: review.id,
      missionId: review.missionId,
      workerId: review.workerId,
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  // Mission helpers
  async findMissionById(missionId: string): Promise<MissionData | null> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        clientId: true,
        workerId: true,
        status: true,
        reviewStatus: true,
      },
    });

    if (!mission) return null;

    return {
      id: mission.id,
      clientId: mission.clientId,
      workerId: mission.workerId,
      status: mission.status,
      reviewStatus: mission.reviewStatus,
    };
  }

  async updateMissionReviewStatus(missionId: string, status: string): Promise<void> {
    await this.prisma.mission.update({
      where: { id: missionId },
      data: { reviewStatus: status as any },
    });
  }

  // Worker helpers
  async updateWorkerRating(workerId: string, averageRating: number, totalReviews: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: workerId },
      data: {
        averageRating,
        totalReviews,
      },
    });
  }

  // Dispute helpers
  async findActiveDisputeByMission(missionId: string): Promise<DisputeData | null> {
    const dispute = await this.prisma.dispute.findFirst({
      where: {
        missionId,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
      select: {
        id: true,
        status: true,
        missionId: true,
      },
    });

    if (!dispute) return null;

    return {
      id: dispute.id,
      status: dispute.status,
      missionId: dispute.missionId,
    };
  }

  // Transaction support
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
