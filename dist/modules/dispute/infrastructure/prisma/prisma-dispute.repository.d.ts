import { PrismaClient } from '@prisma/client';
import type { Dispute, DisputeEvidence } from '@prisma/client';
import type { IDisputeRepository, CreateDisputeInput, UpdateDisputeInput, DisputeFilters, PaginatedResult, CreateEvidenceInput, CreateDisputeEventInput, DisputeEventData } from '../../application/dispute.repository.interface.js';
export declare class PrismaDisputeRepository implements IDisputeRepository {
    private prisma;
    constructor(prisma: PrismaClient);
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
     * Active = OPEN or UNDER_REVIEW
     */
    findActiveByMission(missionId: string): Promise<Dispute | null>;
    /**
     * Find disputes where user is reporter or reported
     */
    findByUserId(userId: string, page: number, limit: number): Promise<PaginatedResult<Dispute>>;
    /**
     * Find evidence by ID
     */
    findEvidenceById(evidenceId: string): Promise<DisputeEvidence | null>;
    /**
     * Create dispute event for audit trail
     */
    createEvent(disputeId: string, event: CreateDisputeEventInput): Promise<DisputeEventData>;
    /**
     * Get dispute events for audit trail
     */
    getEvents(disputeId: string): Promise<DisputeEventData[]>;
    /**
     * Update mission status
     */
    updateMissionStatus(missionId: string, status: string): Promise<void>;
}
//# sourceMappingURL=prisma-dispute.repository.d.ts.map