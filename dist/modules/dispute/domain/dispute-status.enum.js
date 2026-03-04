// ============================================================================
// DISPUTE STATUS ENUM - Domain Layer
// ============================================================================
// Represents all possible statuses of a dispute in the system
// ============================================================================
import { DisputeStatus as PrismaDisputeStatus } from '@prisma/client';
export const DisputeStatus = PrismaDisputeStatus;
// Valid status transitions
export const DISPUTE_STATUS_TRANSITIONS = {
    PENDING: ['OPEN', 'CLOSED'],
    OPEN: ['UNDER_REVIEW', 'CLOSED'],
    UNDER_REVIEW: ['RESOLVED', 'OPEN'],
    RESOLVED: ['CLOSED'],
    CLOSED: [], // Terminal state - no transitions allowed
};
// Human-readable labels
export const DISPUTE_STATUS_LABELS = {
    PENDING: 'En attente de validation',
    OPEN: 'Dispute ouverte',
    UNDER_REVIEW: 'En cours d\'examen',
    RESOLVED: 'Résolue',
    CLOSED: 'Fermée',
};
export const isValidDisputeStatus = (status) => {
    return ['PENDING', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].includes(status);
};
export const canTransitionTo = (currentStatus, targetStatus) => {
    return DISPUTE_STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
};
//# sourceMappingURL=dispute-status.enum.js.map