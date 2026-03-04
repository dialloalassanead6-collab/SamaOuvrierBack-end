import { DisputeReason as PrismaDisputeReason } from '@prisma/client';
export type DisputeReasonType = PrismaDisputeReason;
export declare const DISPUTE_REASON_LABELS: Record<DisputeReasonType, string>;
export declare const isValidDisputeReason: (reason: string) => reason is DisputeReasonType;
//# sourceMappingURL=dispute-reason.enum.d.ts.map