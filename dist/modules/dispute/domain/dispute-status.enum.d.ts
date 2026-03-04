import { DisputeStatus as PrismaDisputeStatus } from '@prisma/client';
export type DisputeStatusType = PrismaDisputeStatus;
export declare const DisputeStatus: {
    PENDING: "PENDING";
    OPEN: "OPEN";
    UNDER_REVIEW: "UNDER_REVIEW";
    RESOLVED: "RESOLVED";
    CLOSED: "CLOSED";
};
export declare const DISPUTE_STATUS_TRANSITIONS: Record<DisputeStatusType, DisputeStatusType[]>;
export declare const DISPUTE_STATUS_LABELS: Record<DisputeStatusType, string>;
export declare const isValidDisputeStatus: (status: string) => status is DisputeStatusType;
export declare const canTransitionTo: (currentStatus: DisputeStatusType, targetStatus: DisputeStatusType) => boolean;
//# sourceMappingURL=dispute-status.enum.d.ts.map