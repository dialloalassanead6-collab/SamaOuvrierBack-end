// ============================================================================
// RESOLVE DISPUTE USE CASE - Application Layer
// ============================================================================
// Handles resolving disputes by admin with transactional escrow logic
// ============================================================================
import { DisputeDomainError } from '../../domain/index.js';
import { prisma } from '../../../../shared/database/index.js';
import { DisputeStatus, DisputeResolution, EscrowStatus, MissionStatus } from '@prisma/client';
import { NotificationService } from '../../../notification/index.js';
// Dispute event types for audit trail
const DISPUTE_EVENTS = {
    STATUS_CHANGED: 'STATUS_CHANGED',
    RESOLUTION_APPLIED: 'RESOLUTION_APPLIED',
};
export class ResolveDisputeUseCase {
    disputeRepository;
    notificationService;
    constructor(disputeRepository, notificationService) {
        this.disputeRepository = disputeRepository;
        this.notificationService = notificationService;
    }
    /**
     * Execute the use case to resolve a dispute
     * With hardened security:
     * - Admin only (enforced at controller level)
     * - Verifies dispute is in UNDER_REVIEW status
     * - Prevents resolution if already RESOLVED or CLOSED
     * - Encapsulates all financial logic in a transaction
     * - Creates audit trail events
     */
    async execute(input) {
        // 1. Find the dispute with mission details
        const dispute = await this.disputeRepository.findById(input.disputeId);
        if (!dispute) {
            throw new DisputeDomainError('Dispute introuvable');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyDispute = dispute;
        // 2. ✅ INTERDIRE RÉSOLUTION SI DÉJÀ RÉSOLUE OU FERMÉE
        if (anyDispute.status === DisputeStatus.RESOLVED || anyDispute.status === DisputeStatus.CLOSED) {
            throw new DisputeDomainError('Cette dispute a déjà été résolue ou fermée. Impossible de la résoudre à nouveau.');
        }
        // 3. ✅ VÉRIFIER STATUS SOUS EXAMEN
        if (anyDispute.status !== DisputeStatus.UNDER_REVIEW) {
            throw new DisputeDomainError(`La dispute ne peut pas être résolue dans son état actuel: ${anyDispute.status}. Elle doit être mise sous examen avant résolution.`);
        }
        // 4. ✅ TRANSACTIONS FINANCIÈRES - Atomicité complète
        const resolvedDispute = await this.disputeRepository.transaction(async () => {
            // Update the dispute with resolution
            const updatedDispute = await this.disputeRepository.update(input.disputeId, {
                status: DisputeStatus.RESOLVED,
                resolution: input.resolution,
                resolutionNote: input.resolutionNote || null,
                resolvedBy: input.resolvedBy,
                resolvedAt: new Date(),
            });
            // Handle escrow based on resolution
            await this.handleEscrowResolution(anyDispute.mission_id, input.resolution);
            // Create status change audit event
            await this.disputeRepository.createEvent(input.disputeId, {
                type: DISPUTE_EVENTS.STATUS_CHANGED,
                performedBy: input.resolvedBy,
                metadata: {
                    previousStatus: anyDispute.status,
                    newStatus: DisputeStatus.RESOLVED,
                },
            });
            // Create resolution audit event
            await this.disputeRepository.createEvent(input.disputeId, {
                type: DISPUTE_EVENTS.RESOLUTION_APPLIED,
                performedBy: input.resolvedBy,
                metadata: {
                    resolution: input.resolution,
                    resolutionNote: input.resolutionNote,
                },
            });
            return updatedDispute;
        });
        // 5. Return result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyResolved = resolvedDispute;
        // Notifier les parties de la résolution de la dispute
        try {
            // Récupérer les informations de la mission pour les notifications
            const mission = await prisma.mission.findUnique({
                where: { id: anyResolved.mission_id },
                select: { clientId: true, workerId: true },
            });
            if (mission) {
                await this.notificationService.notifyDisputeResolved({
                    disputeId: anyResolved.id,
                    missionId: anyResolved.mission_id,
                    reporterId: mission.clientId === anyResolved.reporter_id ? mission.clientId : mission.workerId,
                    reportedUserId: mission.clientId === anyResolved.reporter_id ? mission.workerId : mission.clientId,
                    resolution: anyResolved.resolution,
                });
            }
        }
        catch (notificationError) {
            // Log l'erreur mais ne pas bloquer la résolution
            console.error('Erreur lors de l\'envoi de la notification de résolution:', notificationError);
        }
        return {
            id: anyResolved.id,
            status: anyResolved.status,
            resolution: anyResolved.resolution,
            resolutionNote: anyResolved.resolution_note,
            resolvedBy: anyResolved.resolved_by,
            resolvedAt: anyResolved.resolved_at,
        };
    }
    /**
     * Handle escrow release or refund based on resolution
     * This is critical financial logic - must be within transaction
     */
    async handleEscrowResolution(missionId, resolution) {
        // Find the escrow for this mission
        const escrow = await prisma.escrow.findUnique({
            where: { missionId },
        });
        if (!escrow) {
            // No escrow found - mission might not have been paid yet
            // Still update mission status
            await this.disputeRepository.updateMissionStatus(missionId, MissionStatus.CANCELLED);
            return;
        }
        // Handle based on resolution type
        switch (resolution) {
            case DisputeResolution.CLIENT_WINS:
            case DisputeResolution.FULL_REFUND:
                // Refund the client - release escrow back to client
                await prisma.escrow.update({
                    where: { id: escrow.id },
                    data: {
                        status: EscrowStatus.REFUNDED,
                        releaseType: 'FULL_REFUND',
                        releasedBy: 'SYSTEM',
                        releaseReason: 'Dispute resolved - client wins / full refund',
                        releasedAt: new Date(),
                    },
                });
                // Update mission status to cancelled
                await this.disputeRepository.updateMissionStatus(missionId, MissionStatus.CANCELLED);
                break;
            case DisputeResolution.WORKER_WINS:
                // Release payment to worker
                await prisma.escrow.update({
                    where: { id: escrow.id },
                    data: {
                        status: EscrowStatus.RELEASED,
                        releaseType: 'FULL',
                        releasedBy: 'SYSTEM',
                        releaseReason: 'Dispute resolved - worker wins',
                        releasedAt: new Date(),
                    },
                });
                // Update mission status to completed
                await this.disputeRepository.updateMissionStatus(missionId, MissionStatus.COMPLETED);
                break;
            case DisputeResolution.PARTIAL_REFUND:
                // Partial refund to client, partial to worker
                const clientRefundAmount = escrow.amount.mul(0.5); // 50% refund
                const workerAmount = escrow.amount.sub(clientRefundAmount);
                await prisma.escrow.update({
                    where: { id: escrow.id },
                    data: {
                        status: EscrowStatus.PARTIALLY_REFUNDED,
                        workerAmount,
                        releaseType: 'PARTIAL_WORKER',
                        releasedBy: 'SYSTEM',
                        releaseReason: 'Dispute resolved - partial refund',
                        releasedAt: new Date(),
                    },
                });
                // Update mission status
                await this.disputeRepository.updateMissionStatus(missionId, MissionStatus.COMPLETED);
                break;
            case DisputeResolution.NO_REFUND:
            case DisputeResolution.DRAW:
            default:
                // No refund - worker keeps the money, mission completed
                await prisma.escrow.update({
                    where: { id: escrow.id },
                    data: {
                        status: EscrowStatus.RELEASED,
                        releaseType: 'FULL',
                        releasedBy: 'SYSTEM',
                        releaseReason: `Dispute resolved - ${resolution}`,
                        releasedAt: new Date(),
                    },
                });
                await this.disputeRepository.updateMissionStatus(missionId, MissionStatus.COMPLETED);
                break;
        }
    }
}
//# sourceMappingURL=resolve-dispute.usecase.js.map