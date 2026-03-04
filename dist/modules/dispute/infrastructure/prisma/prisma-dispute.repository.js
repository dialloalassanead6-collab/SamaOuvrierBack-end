// ============================================================================
// PRISMA DISPUTE REPOSITORY - Infrastructure Layer
// ============================================================================
// Implementation of IDisputeRepository using Prisma
// ============================================================================
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
export class PrismaDisputeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        return this.prisma.dispute.create({
            data: {
                missionId: input.missionId,
                reporterId: input.reporterId,
                reportedUserId: input.reportedUserId,
                reason: input.reason,
                description: input.description,
                status: 'PENDING',
            },
        });
    }
    async findById(id) {
        return this.prisma.dispute.findUnique({
            where: { id },
            include: {
                evidences: true,
                mission: true,
                reporter: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                    },
                },
                reportedUser: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findByMissionAndReporter(missionId, reporterId) {
        return this.prisma.dispute.findUnique({
            where: {
                dispute_mission_reporter_unique: {
                    missionId,
                    reporterId,
                },
            },
        });
    }
    async findAll(filters, page, limit) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.reporterId) {
            where.reporterId = filters.reporterId;
        }
        if (filters.reportedUserId) {
            where.reportedUserId = filters.reportedUserId;
        }
        if (filters.missionId) {
            where.missionId = filters.missionId;
        }
        if (filters.resolvedBy) {
            where.resolvedBy = filters.resolvedBy;
        }
        const [data, total] = await Promise.all([
            this.prisma.dispute.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    mission: {
                        select: {
                            id: true,
                            status: true,
                        },
                    },
                    reporter: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                    reportedUser: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                    _count: {
                        select: {
                            evidences: true,
                        },
                    },
                },
            }),
            this.prisma.dispute.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async update(id, input) {
        const updateData = {};
        if (input.status) {
            updateData.status = input.status;
        }
        if (input.resolution !== undefined) {
            updateData.resolution = input.resolution;
        }
        if (input.resolutionNote !== undefined) {
            updateData.resolutionNote = input.resolutionNote;
        }
        if (input.resolvedBy !== undefined) {
            updateData.resolvedBy = input.resolvedBy;
        }
        if (input.resolvedAt) {
            updateData.resolvedAt = input.resolvedAt;
        }
        return this.prisma.dispute.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        await this.prisma.dispute.delete({
            where: { id },
        });
    }
    async transaction(fn) {
        return this.prisma.$transaction(fn);
    }
    async addEvidence(disputeId, evidence) {
        return this.prisma.disputeEvidence.create({
            data: {
                disputeId,
                url: evidence.url,
                publicId: evidence.publicId,
                type: evidence.type,
                mimeType: evidence.mimeType ?? null,
                size: evidence.size ?? null,
                description: evidence.description ?? null,
                uploadedBy: evidence.uploadedBy,
            },
        });
    }
    async getEvidence(disputeId) {
        return this.prisma.disputeEvidence.findMany({
            where: { disputeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteEvidence(evidenceId) {
        await this.prisma.disputeEvidence.delete({
            where: { id: evidenceId },
        });
    }
    // ============================================================================
    // NEW METHODS FOR HARDENING
    // ============================================================================
    /**
     * Find active disputes by mission ID
     * Active = OPEN or UNDER_REVIEW
     */
    async findActiveByMission(missionId) {
        return this.prisma.dispute.findFirst({
            where: {
                missionId,
                status: {
                    in: ['OPEN', 'UNDER_REVIEW'],
                },
            },
        });
    }
    /**
     * Find disputes where user is reporter or reported
     */
    async findByUserId(userId, page, limit) {
        const where = {
            OR: [
                { reporterId: userId },
                { reportedUserId: userId },
            ],
        };
        const [data, total] = await Promise.all([
            this.prisma.dispute.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    mission: {
                        select: {
                            id: true,
                            status: true,
                            service: {
                                select: {
                                    title: true,
                                },
                            },
                        },
                    },
                    reporter: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                    reportedUser: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                        },
                    },
                    _count: {
                        select: {
                            evidences: true,
                        },
                    },
                },
            }),
            this.prisma.dispute.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Find evidence by ID
     */
    async findEvidenceById(evidenceId) {
        return this.prisma.disputeEvidence.findUnique({
            where: { id: evidenceId },
        });
    }
    /**
     * Create dispute event for audit trail
     */
    async createEvent(disputeId, event) {
        const created = await this.prisma.disputeEvent.create({
            data: {
                disputeId,
                type: event.type,
                performedBy: event.performedBy,
                metadata: event.metadata ?? undefined,
            },
        });
        return {
            id: created.id,
            disputeId: created.disputeId,
            type: created.type,
            performedBy: created.performedBy,
            metadata: created.metadata,
            createdAt: created.createdAt,
        };
    }
    /**
     * Get dispute events for audit trail
     */
    async getEvents(disputeId) {
        const events = await this.prisma.disputeEvent.findMany({
            where: { disputeId },
            orderBy: { createdAt: 'asc' },
        });
        return events.map((e) => ({
            id: e.id,
            disputeId: e.disputeId,
            type: e.type,
            performedBy: e.performedBy,
            metadata: e.metadata,
            createdAt: e.createdAt,
        }));
    }
    /**
     * Update mission status
     */
    async updateMissionStatus(missionId, status) {
        await this.prisma.mission.update({
            where: { id: missionId },
            data: { status: status },
        });
    }
}
//# sourceMappingURL=prisma-dispute.repository.js.map