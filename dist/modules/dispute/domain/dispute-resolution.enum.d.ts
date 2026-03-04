import { DisputeResolution as PrismaDisputeResolution } from '@prisma/client';
export type DisputeResolutionType = PrismaDisputeResolution;
export declare const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolutionType, string>;
export declare const isValidDisputeResolution: (resolution: string) => resolution is DisputeResolutionType;
//# sourceMappingURL=dispute-resolution.enum.d.ts.map