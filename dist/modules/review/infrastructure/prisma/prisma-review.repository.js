/**
 * Prisma Review Repository - Infrastructure Layer
 * Implementation of IReviewRepository using Prisma
 */
import { PrismaClient } from '@prisma/client';
export class PrismaReviewRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
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
    async findById(id) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });
        if (!review)
            return null;
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
    async findByMissionId(missionId) {
        const review = await this.prisma.review.findUnique({
            where: { missionId },
        });
        if (!review)
            return null;
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
    async findAll(filters, skip, limit) {
        const where = {};
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
    async findAllEnriched(filters, skip, limit) {
        const where = {};
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
        const enrichedData = data.map((review) => ({
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
    async findByWorkerId(workerId) {
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
    async findByClientId(clientId) {
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
    async delete(id) {
        await this.prisma.review.delete({
            where: { id },
        });
    }
    // Mission helpers
    async findMissionById(missionId) {
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
        if (!mission)
            return null;
        return {
            id: mission.id,
            clientId: mission.clientId,
            workerId: mission.workerId,
            status: mission.status,
            reviewStatus: mission.reviewStatus,
        };
    }
    async updateMissionReviewStatus(missionId, status) {
        await this.prisma.mission.update({
            where: { id: missionId },
            data: { reviewStatus: status },
        });
    }
    // Worker helpers
    async updateWorkerRating(workerId, averageRating, totalReviews) {
        await this.prisma.user.update({
            where: { id: workerId },
            data: {
                averageRating,
                totalReviews,
            },
        });
    }
    // Dispute helpers
    async findActiveDisputeByMission(missionId) {
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
        if (!dispute)
            return null;
        return {
            id: dispute.id,
            status: dispute.status,
            missionId: dispute.missionId,
        };
    }
    // Transaction support
    async transaction(fn) {
        return this.prisma.$transaction(fn);
    }
}
//# sourceMappingURL=prisma-review.repository.js.map