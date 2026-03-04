import type { IDisputeRepository } from '../dispute.repository.interface.js';
import { NotificationService } from '../../../notification/index.js';
export interface CreateDisputeInputDTO {
    missionId: string;
    reporterId: string;
    reason: string;
    description: string;
}
export interface CreateDisputeOutputDTO {
    id: string;
    missionId: string;
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description: string;
    status: string;
    createdAt: Date;
}
export declare class CreateDisputeUseCase {
    private disputeRepository;
    private notificationService;
    constructor(disputeRepository: IDisputeRepository, notificationService: NotificationService);
    /**
     * Execute the use case to create a new dispute
     * With hardened business rules:
     * - Validates mission membership (client or worker only)
     * - Checks mission status allows dispute
     * - Prevents duplicate active disputes
     * - Creates audit trail event
     */
    execute(input: CreateDisputeInputDTO): Promise<CreateDisputeOutputDTO>;
}
//# sourceMappingURL=create-dispute.usecase.d.ts.map