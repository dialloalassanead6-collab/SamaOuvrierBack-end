// ============================================================================
// GET DISPUTES USE CASE - Application Layer
// ============================================================================
// Handles retrieving disputes with filtering and pagination
// ============================================================================
export class GetDisputesUseCase {
    disputeRepository;
    constructor(disputeRepository) {
        this.disputeRepository = disputeRepository;
    }
    async execute(input) {
        const page = input.page ?? 1;
        const limit = input.limit ?? 10;
        const filters = {};
        if (input.filters?.status) {
            filters.status = input.filters.status;
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
            data: result.data.map((d) => ({
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
//# sourceMappingURL=get-disputes.usecase.js.map