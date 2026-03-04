import type { IDisputeRepository } from '../dispute.repository.interface.js';
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
export declare class GetDisputesUseCase {
    private disputeRepository;
    constructor(disputeRepository: IDisputeRepository);
    execute(input: GetDisputesInputDTO): Promise<GetDisputesOutputDTO>;
}
//# sourceMappingURL=get-disputes.usecase.d.ts.map