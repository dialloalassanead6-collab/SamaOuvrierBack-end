// ============================================================================
// DISPUTE RESOLUTION ENUM - Domain Layer
// ============================================================================
// Represents all possible resolutions for a dispute
// ============================================================================

import { DisputeResolution as PrismaDisputeResolution } from '@prisma/client';

export type DisputeResolutionType = PrismaDisputeResolution;

// Human-readable labels
export const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolutionType, string> = {
  CLIENT_WINS: 'Le client gagne',
  WORKER_WINS: 'Le worker gagne',
  PARTIAL_REFUND: 'Remboursement partiel',
  FULL_REFUND: 'Remboursement complet',
  NO_REFUND: 'Aucun remboursement',
  DRAW: 'Match nul (partiel)',
};

export const isValidDisputeResolution = (resolution: string): resolution is DisputeResolutionType => {
  return [
    'CLIENT_WINS',
    'WORKER_WINS',
    'PARTIAL_REFUND',
    'FULL_REFUND',
    'NO_REFUND',
    'DRAW',
  ].includes(resolution);
};
