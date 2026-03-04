// ============================================================================
// GET DISPUTES USE CASE - Application Layer
// ============================================================================
// Handles retrieving disputes with filtering and pagination
// ============================================================================

import type { IDisputeRepository, DisputeFilters } from '../dispute.repository.interface.js';

export interface GetDisputesInputDTO {
  filters?: {
    status?: string;
    reporterId?: string;
    reportedUserId?: string;
    missionId?: string;
  };
  page?: number;
  limit?: number;
}

export interface DisputeDTO {
  id: string;
  missionId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
  status: string;
  resolution?: string | null;
  resolutionNote?: string | null;
  resolvedBy?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
}

export interface GetDisputesOutputDTO {
  data: DisputeDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GetDisputesUseCase {
  constructor(private disputeRepository: IDisputeRepository) {}

  async execute(input: GetDisputesInputDTO): Promise<GetDisputesOutputDTO> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    
    const filters: DisputeFilters = {};
    
    if (input.filters?.status) {
      filters.status = input.filters.status as import('@prisma/client').DisputeStatus;
    }
    if (input.filters?.reporterId) {
      filters.reporterId = input.filters.reporterId;
    }
    if (input.filters?.reportedUserId) {
      filters.reportedUserId = input.filters.reportedUserId;
    }
    if (input.filters?.missionId) {
      filters.missionId = input.filters.missionId;
    }

    const result = await this.disputeRepository.findAll(filters, page, limit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      data: result.data.map((d: any) => ({
        id: d.id,
        missionId: d.mission_id,
        reporterId: d.reporter_id,
        reportedUserId: d.reported_user_id,
        reason: d.reason,
        description: d.description,
        status: d.status,
        resolution: d.resolution,
        resolutionNote: d.resolution_note,
        resolvedBy: d.resolved_by,
        createdAt: d.created_at,
        resolvedAt: d.resolved_at,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
