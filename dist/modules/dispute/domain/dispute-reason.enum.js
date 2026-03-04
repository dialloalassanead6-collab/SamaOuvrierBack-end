// ============================================================================
// DISPUTE REASON ENUM - Domain Layer
// ============================================================================
// Represents all possible reasons for opening a dispute
// ============================================================================
import { DisputeReason as PrismaDisputeReason } from '@prisma/client';
// Human-readable labels
export const DISPUTE_REASON_LABELS = {
    PAYMENT_ISSUE: 'Problème de paiement',
    WORK_NOT_DONE: 'Travail non effectué',
    QUALITY_UNSATISFACTORY: 'Qualité insatisfaisante',
    NO_SHOW: 'absence du worker',
    CANCELLATION_ISSUE: 'Problème d\'annulation',
    COMMUNICATION_ISSUE: 'Problème de communication',
    OTHER: 'Autre',
};
export const isValidDisputeReason = (reason) => {
    return [
        'PAYMENT_ISSUE',
        'WORK_NOT_DONE',
        'QUALITY_UNSATISFACTORY',
        'NO_SHOW',
        'CANCELLATION_ISSUE',
        'COMMUNICATION_ISSUE',
        'OTHER',
    ].includes(reason);
};
//# sourceMappingURL=dispute-reason.enum.js.map