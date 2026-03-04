// ============================================================================
// DISPUTE REPOSITORY INTERFACE - Application Layer
// ============================================================================
// Abstract interface for dispute data access
// Follows the Dependency Inversion Principle
// ============================================================================

import type { Dispute, DisputeEvidence, DisputeStatus, DisputeReason, DisputeResolution } from '@prisma/client';

export interface CreateDisputeInput {
  missionId: string;
  reporterId: string;
  reportedUserId: string;
  reason: DisputeReason;
  description: string;
}

export interface UpdateDisputeInput {
  status?: DisputeStatus;
  resolution?: DisputeResolution;
  resolutionNote?: string | null;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface DisputeFilters {
  status?: DisputeStatus;
  reporterId?: string;
  reportedUserId?: string;
  missionId?: string;
  resolvedBy?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IDisputeRepository {
  // Dispute CRUD
  create(input: CreateDisputeInput): Promise<Dispute>;
  findById(id: string): Promise<Dispute | null>;
  findByMissionAndReporter(missionId: string, reporterId: string): Promise<Dispute | null>;
  findAll(filters: DisputeFilters, page: number, limit: number): Promise<PaginatedResult<Dispute>>;
  update(id: string, input: UpdateDisputeInput): Promise<Dispute>;
  delete(id: string): Promise<void>;

  // Transaction support
  transaction<T>(fn: () => Promise<T>): Promise<T>;

  // Evidence
  addEvidence(disputeId: string, evidence: CreateEvidenceInput): Promise<DisputeEvidence>;
  getEvidence(disputeId: string): Promise<DisputeEvidence[]>;
  deleteEvidence(evidenceId: string): Promise<void>;

  // ============================================================================
  // NEW METHODS FOR HARDENING
  // ============================================================================

  /**
   * Find active disputes by mission ID
   * Used to prevent duplicate active disputes
   */
  findActiveByMission(missionId: string): Promise<Dispute | null>;

  /**
   * Find disputes where user is reporter or reported
   * Used for GET /disputes/my
   */
  findByUserId(userId: string, page: number, limit: number): Promise<PaginatedResult<Dispute>>;

  /**
   * Find evidence by ID
   */
  findEvidenceById(evidenceId: string): Promise<DisputeEvidence | null>;

  /**
   * Create dispute event for audit trail
   * Returns the created event with all fields
   */
  createEvent(disputeId: string, event: CreateDisputeEventInput): Promise<DisputeEventData>;

  /**
   * Get dispute events for audit trail
   */
  getEvents(disputeId: string): Promise<DisputeEventData[]>;

  /**
   * Update mission within a transaction
   * Used for escrow release/refund during dispute resolution
   */
  updateMissionStatus(missionId: string, status: string): Promise<void>;
}

export interface CreateEvidenceInput {
  url: string;
  publicId: string;
  type: string;
  mimeType?: string;
  size?: number;
  description?: string | null;
  uploadedBy: string;
}

export interface CreateDisputeEventInput {
  type: string;
  performedBy: string;
  metadata?: Record<string, unknown> | null;
}

// DisputeEvent type for return values (matches Prisma generated type)
export interface DisputeEventData {
  id: string;
  disputeId: string;
  type: string;
  performedBy: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
