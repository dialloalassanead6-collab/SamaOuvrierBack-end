// ============================================================================
// DISPUTE ENTITY - Domain Layer
// ============================================================================
// Core domain entity representing a dispute between client and worker
// Encapsulates business rules and state transitions
// ============================================================================
import { DisputeStatus } from './dispute-status.enum.js';
// Mission statuses that allow dispute creation
export const ELIGIBLE_MISSION_STATUSES_FOR_DISPUTE = [
    'IN_PROGRESS',
    'AWAITING_FINAL_PAYMENT',
    'CANCEL_REQUESTED',
];
/**
 * Dispute Entity
 *
 * RESPONSABILITÉS:
 * - Représenter une dispute dans le système
 * - Encapsuler les règles métier liées aux disputes
 * - Gérer les transitions de statut
 * - Valider les invariants métier
 *
 * INVARIANTS:
 * - reporterId et reportedUserId sont obligatoires et différents
 * - reason et description sont obligatoires
 * - status doit suivre les transitions valides
 * - resolution ne peut être défini que par un admin
 */
export class Dispute {
    id;
    missionId;
    reporterId;
    reportedUserId;
    reason;
    description;
    status;
    resolution;
    resolutionNote;
    resolvedBy;
    createdAt;
    updatedAt;
    resolvedAt;
    deletedAt;
    constructor(props) {
        this.validateReporterAndReported(props.reporterId, props.reportedUserId);
        this.id = props.id;
        this.missionId = props.missionId;
        this.reporterId = props.reporterId;
        this.reportedUserId = props.reportedUserId;
        this.reason = props.reason;
        this.description = props.description;
        this.status = props.status ?? DisputeStatus.PENDING;
        this.resolution = props.resolution ?? null;
        this.resolutionNote = props.resolutionNote ?? null;
        this.resolvedBy = props.resolvedBy ?? null;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.resolvedAt = props.resolvedAt ?? null;
        this.deletedAt = props.deletedAt ?? null;
    }
    // ============================================================================
    // VALIDATIONS D'INVARIANTS
    // ============================================================================
    validateReporterAndReported(reporterId, reportedUserId) {
        if (reporterId === reportedUserId) {
            throw new DisputeDomainError('Un utilisateur ne peut pas ouvrir une dispute contre lui-même');
        }
    }
    // ============================================================================
    // MÉTHODES DE DOMAINE
    // ============================================================================
    /**
     * Vérifie si une dispute peut être créée pour ce statut de mission
     */
    static canBeCreated(missionStatus) {
        return ELIGIBLE_MISSION_STATUSES_FOR_DISPUTE.includes(missionStatus);
    }
    /**
     * Vérifie si la dispute peut être ouverte
     */
    canBeOpened() {
        return this.status === DisputeStatus.PENDING;
    }
    /**
     * Ouvre la dispute (transition PENDING -> OPEN)
     */
    open() {
        if (!this.canBeOpened()) {
            throw new DisputeDomainError('La dispute ne peut pas être ouverte dans son état actuel');
        }
        return new Dispute({
            ...this.toProps(),
            status: DisputeStatus.OPEN,
            updatedAt: new Date(),
        });
    }
    /**
     * Vérifie si la dispute peut être mise en examen
     */
    canBeReviewed() {
        return this.status === DisputeStatus.OPEN;
    }
    /**
     * Met la dispute en examen (transition OPEN -> UNDER_REVIEW)
     */
    startReview() {
        if (!this.canBeReviewed()) {
            throw new DisputeDomainError('La dispute ne peut pas être mise en examen dans son état actuel');
        }
        return new Dispute({
            ...this.toProps(),
            status: DisputeStatus.UNDER_REVIEW,
            updatedAt: new Date(),
        });
    }
    /**
     * Vérifie si la dispute peut être résolue
     */
    canBeResolved() {
        return this.status === DisputeStatus.UNDER_REVIEW;
    }
    /**
     * Résout la dispute (transition UNDER_REVIEW -> RESOLVED)
     */
    resolve(resolution, resolutionNote, adminId) {
        if (!this.canBeResolved()) {
            throw new DisputeDomainError('La dispute ne peut pas être résolue dans son état actuel');
        }
        return new Dispute({
            ...this.toProps(),
            status: DisputeStatus.RESOLVED,
            resolution,
            resolutionNote,
            resolvedBy: adminId,
            resolvedAt: new Date(),
            updatedAt: new Date(),
        });
    }
    /**
     * Vérifie si la dispute peut être fermée
     */
    canBeClosed() {
        return ['PENDING', 'OPEN', 'RESOLVED'].includes(this.status);
    }
    /**
     * Ferme la dispute (transition vers CLOSED)
     */
    close() {
        if (!this.canBeClosed()) {
            throw new DisputeDomainError('La dispute ne peut pas être fermée dans son état actuel');
        }
        return new Dispute({
            ...this.toProps(),
            status: DisputeStatus.CLOSED,
            updatedAt: new Date(),
        });
    }
    /**
     * Vérifie si l'utilisateur est autorisé à voir cette dispute
     */
    canBeViewedBy(userId, userRole) {
        if (userRole === 'ADMIN')
            return true;
        return this.reporterId === userId || this.reportedUserId === userId;
    }
    /**
     * Vérifie si l'utilisateur peut ajouter des preuves
     */
    canAddEvidence(userId) {
        if (this.status === DisputeStatus.CLOSED || this.status === DisputeStatus.RESOLVED) {
            return false;
        }
        return this.reporterId === userId || this.reportedUserId === userId;
    }
    // ============================================================================
    // TRANSFORMATION
    // ============================================================================
    /**
     * Convertit l'entité en objet de props
     */
    toProps() {
        return {
            id: this.id,
            missionId: this.missionId,
            reporterId: this.reporterId,
            reportedUserId: this.reportedUserId,
            reason: this.reason,
            description: this.description,
            status: this.status,
            resolution: this.resolution,
            resolutionNote: this.resolutionNote,
            resolvedBy: this.resolvedBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            resolvedAt: this.resolvedAt,
            deletedAt: this.deletedAt,
        };
    }
    /**
     * Crée une entité Dispute à partir d'un objet Prisma
     */
    static fromPrisma(dispute) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyDispute = dispute;
        return new Dispute({
            id: dispute.id,
            missionId: anyDispute.mission_id,
            reporterId: anyDispute.reporter_id,
            reportedUserId: anyDispute.reported_user_id,
            reason: dispute.reason,
            description: dispute.description,
            status: dispute.status,
            resolution: dispute.resolution,
            resolutionNote: anyDispute.resolution_note,
            resolvedBy: anyDispute.resolved_by,
            createdAt: anyDispute.created_at,
            updatedAt: anyDispute.updated_at,
            resolvedAt: anyDispute.resolved_at ?? null,
            deletedAt: anyDispute.deleted_at ?? null,
        });
    }
}
// ============================================================================
// DOMAIN EXCEPTIONS
// ============================================================================
export class DisputeDomainError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DisputeDomainError';
    }
}
//# sourceMappingURL=dispute.entity.js.map