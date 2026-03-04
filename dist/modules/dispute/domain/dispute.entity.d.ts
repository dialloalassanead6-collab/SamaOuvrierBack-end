import type { Dispute as PrismaDispute } from '@prisma/client';
import type { DisputeStatusType } from './dispute-status.enum.js';
import type { DisputeReasonType } from './dispute-reason.enum.js';
import type { DisputeResolutionType } from './dispute-resolution.enum.js';
export declare const ELIGIBLE_MISSION_STATUSES_FOR_DISPUTE: readonly ["IN_PROGRESS", "AWAITING_FINAL_PAYMENT", "CANCEL_REQUESTED"];
export type EligibleMissionStatus = typeof ELIGIBLE_MISSION_STATUSES_FOR_DISPUTE[number];
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
export declare class Dispute {
    readonly id: string;
    readonly missionId: string;
    readonly reporterId: string;
    readonly reportedUserId: string;
    readonly reason: DisputeReasonType;
    readonly description: string;
    readonly status: DisputeStatusType;
    readonly resolution: DisputeResolutionType | null;
    readonly resolutionNote: string | null;
    readonly resolvedBy: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly resolvedAt: Date | null;
    readonly deletedAt: Date | null;
    constructor(props: DisputeProps);
    private validateReporterAndReported;
    /**
     * Vérifie si une dispute peut être créée pour ce statut de mission
     */
    static canBeCreated(missionStatus: string): boolean;
    /**
     * Vérifie si la dispute peut être ouverte
     */
    canBeOpened(): boolean;
    /**
     * Ouvre la dispute (transition PENDING -> OPEN)
     */
    open(): Dispute;
    /**
     * Vérifie si la dispute peut être mise en examen
     */
    canBeReviewed(): boolean;
    /**
     * Met la dispute en examen (transition OPEN -> UNDER_REVIEW)
     */
    startReview(): Dispute;
    /**
     * Vérifie si la dispute peut être résolue
     */
    canBeResolved(): boolean;
    /**
     * Résout la dispute (transition UNDER_REVIEW -> RESOLVED)
     */
    resolve(resolution: DisputeResolutionType, resolutionNote: string | null, adminId: string): Dispute;
    /**
     * Vérifie si la dispute peut être fermée
     */
    canBeClosed(): boolean;
    /**
     * Ferme la dispute (transition vers CLOSED)
     */
    close(): Dispute;
    /**
     * Vérifie si l'utilisateur est autorisé à voir cette dispute
     */
    canBeViewedBy(userId: string, userRole: string): boolean;
    /**
     * Vérifie si l'utilisateur peut ajouter des preuves
     */
    canAddEvidence(userId: string): boolean;
    /**
     * Convertit l'entité en objet de props
     */
    toProps(): DisputeProps;
    /**
     * Crée une entité Dispute à partir d'un objet Prisma
     */
    static fromPrisma(dispute: PrismaDispute): Dispute;
}
export interface DisputeProps {
    id: string;
    missionId: string;
    reporterId: string;
    reportedUserId: string;
    reason: DisputeReasonType;
    description: string;
    status?: DisputeStatusType;
    resolution?: DisputeResolutionType | null;
    resolutionNote?: string | null;
    resolvedBy?: string | null;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date | null;
    deletedAt?: Date | null;
}
export declare class DisputeDomainError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=dispute.entity.d.ts.map