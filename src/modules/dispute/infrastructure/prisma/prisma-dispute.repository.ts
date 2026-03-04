// ============================================================================
// PRISMA DISPUTE REPOSITORY - Infrastructure Layer
// ============================================================================
// Implementation of IDisputeRepository using Prisma
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaClient } from '@prisma/client';
import type { Dispute, DisputeEvidence, MissionStatus } from '@prisma/client';
import type {
  IDisputeRepository,
  CreateDisputeInput,
  UpdateDisputeInput,
  DisputeFilters,
  PaginatedResult,
  CreateEvidenceInput,
  CreateDisputeEventInput,
  DisputeEventData,
} from '../../application/dispute.repository.interface.js';

// Extended prisma type to include disputeEvent
interface ExtendedPrismaClient extends PrismaClient {
  disputeEvent: any;
}

export class PrismaDisputeRepository implements IDisputeRepository {
  private prisma: ExtendedPrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma as ExtendedPrismaClient;
  }

  async create(input: CreateDisputeInput): Promise<Dispute> {
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

  async findById(id: string): Promise<Dispute | null> {
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

  async findByMissionAndReporter(
    missionId: string,
    reporterId: string
  ): Promise<Dispute | null> {
    return this.prisma.dispute.findUnique({
      where: {
        dispute_mission_reporter_unique: {
          missionId,
          reporterId,
        },
      },
    });
  }

  async findAll(
    filters: DisputeFilters,
    page: number,
    limit: number
  ): Promise<PaginatedResult<Dispute>> {
    const where: Record<string, unknown> = {};

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

  async update(
    id: string,
    input: UpdateDisputeInput
  ): Promise<Dispute> {
    const updateData: Record<string, unknown> = {};

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

  async delete(id: string): Promise<void> {
    await this.prisma.dispute.delete({
      where: { id },
    });
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  async addEvidence(
    disputeId: string,
    evidence: CreateEvidenceInput
  ): Promise<DisputeEvidence> {
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

  async getEvidence(
    disputeId: string
  ): Promise<DisputeEvidence[]> {
    return this.prisma.disputeEvidence.findMany({
      where: { disputeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteEvidence(evidenceId: string): Promise<void> {
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
  async findActiveByMission(missionId: string): Promise<Dispute | null> {
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
  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<Dispute>> {
    const where: Record<string, unknown> = {
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
  async findEvidenceById(evidenceId: string): Promise<DisputeEvidence | null> {
    return this.prisma.disputeEvidence.findUnique({
      where: { id: evidenceId },
    });
  }

  /**
   * Create dispute event for audit trail
   */
  async createEvent(
    disputeId: string,
    event: CreateDisputeEventInput
  ): Promise<DisputeEventData> {
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
      metadata: created.metadata as Record<string, unknown> | null,
      createdAt: created.createdAt,
    };
  }

  /**
   * Get dispute events for audit trail
   */
  async getEvents(disputeId: string): Promise<DisputeEventData[]> {
    const events = await this.prisma.disputeEvent.findMany({
      where: { disputeId },
      orderBy: { createdAt: 'asc' },
    });
    
    return events.map((e: any) => ({
      id: e.id,
      disputeId: e.disputeId,
      type: e.type,
      performedBy: e.performedBy,
      metadata: e.metadata as Record<string, unknown> | null,
      createdAt: e.createdAt,
    }));
  }

  /**
   * Update mission status
   */
  async updateMissionStatus(missionId: string, status: string): Promise<void> {
    await this.prisma.mission.update({
      where: { id: missionId },
      data: { status: status as MissionStatus },
    });
  }
}
