import type { IDisputeRepository } from '../dispute.repository.interface.js';
import { NotificationService } from '../../../notification/index.js';
export interface ResolveDisputeInputDTO {
    disputeId: string;
    resolution: string;
    resolutionNote?: string | null;
    resolvedBy: string;
}
export interface ResolveDisputeOutputDTO {
    id: string;
    status: string;
    resolution: string;
    resolutionNote: string | null;
    resolvedBy: string;
    resolvedAt: Date;
}
export declare class ResolveDisputeUseCase {
    private disputeRepository;
    private notificationService;
    constructor(disputeRepository: IDisputeRepository, notificationService: NotificationService);
    /**
     * Execute the use case to resolve a dispute
     * With hardened security:
     * - Admin only (enforced at controller level)
     * - Verifies dispute is in UNDER_REVIEW status
     * - Prevents resolution if already RESOLVED or CLOSED
     * - Encapsulates all financial logic in a transaction
     * - Creates audit trail events
     */
    execute(input: ResolveDisputeInputDTO): Promise<ResolveDisputeOutputDTO>;
    /**
     * Handle escrow release or refund based on resolution
     * This is critical financial logic - must be within transaction
     */
    private handleEscrowResolution;
}
//# sourceMappingURL=resolve-dispute.usecase.d.ts.map