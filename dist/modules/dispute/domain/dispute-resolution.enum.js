// ============================================================================
// DISPUTE RESOLUTION ENUM - Domain Layer
// ============================================================================
// Represents all possible resolutions for a dispute
// ============================================================================
import { DisputeResolution as PrismaDisputeResolution } from '@prisma/client';
// Human-readable labels
export const DISPUTE_RESOLUTION_LABELS = {
    CLIENT_WINS: 'Le client gagne',
    WORKER_WINS: 'Le worker gagne',
    PARTIAL_REFUND: 'Remboursement partiel',
    FULL_REFUND: 'Remboursement complet',
    NO_REFUND: 'Aucun remboursement',
    DRAW: 'Match nul (partiel)',
};
export const isValidDisputeResolution = (resolution) => {
    return [
        'CLIENT_WINS',
        'WORKER_WINS',
        'PARTIAL_REFUND',
        'FULL_REFUND',
        'NO_REFUND',
        'DRAW',
    ].includes(resolution);
};
//# sourceMappingURL=dispute-resolution.enum.js.map