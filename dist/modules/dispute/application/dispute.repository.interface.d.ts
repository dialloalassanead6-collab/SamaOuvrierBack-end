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
    create(input: CreateDisputeInput): Promise<Dispute>;
    findById(id: string): Promise<Dispute | null>;
    findByMissionAndReporter(missionId: string, reporterId: string): Promise<Dispute | null>;
    findAll(filters: DisputeFilters, page: number, limit: number): Promise<PaginatedResult<Dispute>>;
    update(id: string, input: UpdateDisputeInput): Promise<Dispute>;
    delete(id: string): Promise<void>;
    transaction<T>(fn: () => Promise<T>): Promise<T>;
    addEvidence(disputeId: string, evidence: CreateEvidenceInput): Promise<DisputeEvidence>;
    getEvidence(disputeId: string): Promise<DisputeEvidence[]>;
    deleteEvidence(evidenceId: string): Promise<void>;
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
export interface DisputeEventData {
    id: string;
    disputeId: string;
    type: string;
    performedBy: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
//# sourceMappingURL=dispute.repository.interface.d.ts.map