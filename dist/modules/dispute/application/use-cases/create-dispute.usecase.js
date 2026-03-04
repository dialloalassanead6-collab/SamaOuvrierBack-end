// ============================================================================
// CREATE DISPUTE USE CASE - Application Layer
// ============================================================================
// Handles the creation of new disputes with hardened business rules
// ============================================================================
import { DisputeDomainError, ELIGIBLE_MISSION_STATUSES_FOR_DISPUTE } from '../../domain/index.js';
import { prisma } from '../../../../shared/database/index.js';
import { NotificationService } from '../../../notification/index.js';
// Dispute event types for audit trail
const DISPUTE_EVENTS = {
    DISPUTE_OPENED: 'DISPUTE_OPENED',
};
export class CreateDisputeUseCase {
    disputeRepository;
    notificationService;
    constructor(disputeRepository, notificationService) {
        this.disputeRepository = disputeRepository;
        this.notificationService = notificationService;
    }
    /**
     * Execute the use case to create a new dispute
     * With hardened business rules:
     * - Validates mission membership (client or worker only)
     * - Checks mission status allows dispute
     * - Prevents duplicate active disputes
     * - Creates audit trail event
     */
    async execute(input) {
        // 1. Validate mission exists
        const mission = await prisma.mission.findUnique({
            where: { id: input.missionId },
        });
        if (!mission) {
            throw new DisputeDomainError('Mission introuvable');
        }
        // 2. ✅ VERIFICATION D'APPARTENANCE À LA MISSION
        // Check if user is either clientId or workerId
        if (mission.clientId !== input.reporterId && mission.workerId !== input.reporterId) {
            throw new DisputeDomainError('Vous ne pouvez pas ouvrir une dispute pour cette mission. Seuls le client et le worker peuvent ouvrir une dispute.');
        }
        // 3. ✅ INTERDIRE DISPUTE SI MISSION FINALISÉE
        // Check mission status allows dispute
        if (!ELIGIBLE_MISSION_STATUSES_FOR_DISPUTE.includes(mission.status)) {
            throw new DisputeDomainError(`Impossible d'ouvrir une dispute pour une mission en statut: ${mission.status}. La mission doit être en cours, en attente de paiement final, ou en cours d'annulation.`);
        }
        // 4. ✅ EMPÊCHER DOUBLE DISPUTE ACTIF
        // Check if there's already an active dispute for this mission
        const activeDispute = await this.disputeRepository.findActiveByMission(input.missionId);
        if (activeDispute) {
            throw new DisputeDomainError('Une dispute active existe déjà pour cette mission. Veuillez attendre la résolution de la dispute existante.');
        }
        // 5. Determine who is the reported user (the other party)
        const reportedUserId = mission.clientId === input.reporterId
            ? mission.workerId
            : mission.clientId;
        // 6. Check if user already has a dispute for this mission (any status)
        const existingDispute = await this.disputeRepository.findByMissionAndReporter(input.missionId, input.reporterId);
        if (existingDispute) {
            throw new DisputeDomainError('Vous avez déjà ouvert une dispute pour cette mission');
        }
        // 7. Create the dispute within a transaction
        const createdDispute = await this.disputeRepository.transaction(async () => {
            // Create the dispute
            const createInput = {
                missionId: input.missionId,
                reporterId: input.reporterId,
                reportedUserId,
                reason: input.reason,
                description: input.description,
            };
            const dispute = await this.disputeRepository.create(createInput);
            // Create audit event
            await this.disputeRepository.createEvent(dispute.id, {
                type: DISPUTE_EVENTS.DISPUTE_OPENED,
                performedBy: input.reporterId,
                metadata: {
                    missionId: input.missionId,
                    reason: input.reason,
                    reportedUserId,
                },
            });
            return dispute;
        });
        // Notifier les parties de l'ouverture de la dispute
        try {
            await this.notificationService.notifyDisputeOpened({
                disputeId: createdDispute.id,
                missionId: input.missionId,
                reporterId: input.reporterId,
                reportedUserId,
                reason: input.reason,
            });
        }
        catch (notificationError) {
            // Log l'erreur mais ne pas bloquer la création de la dispute
            console.error('Erreur lors de l\'envoi de la notification de dispute:', notificationError);
        }
        // 8. Return the result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyDispute = createdDispute;
        return {
            id: anyDispute.id,
            missionId: anyDispute.mission_id,
            reporterId: anyDispute.reporter_id,
            reportedUserId: anyDispute.reported_user_id,
            reason: anyDispute.reason,
            description: anyDispute.description,
            status: anyDispute.status,
            createdAt: anyDispute.created_at,
        };
    }
}
//# sourceMappingURL=create-dispute.usecase.js.map