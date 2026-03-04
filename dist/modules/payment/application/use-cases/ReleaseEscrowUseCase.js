// ============================================================================
// RELEASE ESCROW USE CASE - APPLICATION LAYER
// ============================================================================.
// Libère les fonds de l'escrow après completion de la mission
// Double confirmation: client + worker
// Transition: HELD → RELEASED, IN_PROGRESS → COMPLETED
// ============================================================================
import { BusinessErrors } from '../../../../shared/errors/business-error.js';
import { MissionStatus } from '../../../mission/domain/index.js';
import { EscrowStatus } from '../../domain/enums/EscrowStatus.js';
import { EscrowDomainService } from '../../domain/services/EscrowDomainService.js';
import { NotificationService } from '../../../notification/index.js';
/**
 * Release Escrow Use Case
 *
 * RESPONSABILITÉ:
 * - Libérer les fonds de l'escrow après double confirmation
 * - Payer le worker (90%) et la commission (10%)
 * - Mettre à jour le statut de la mission vers COMPLETED
 * - Notifier le worker du paiement libéré
 *
 * SCÉNARIO:
 * 1. Vérifier que l'escrow existe et est en attente (HELD)
 * 2. Vérifier que la mission est en cours (IN_PROGRESS)
 * 3. Marquer la confirmation du user (client ou worker)
 * 4. Si les deux ont confirmé:
 *    a. Libérer les fonds vers le worker
 *    b. Mettre à jour le paiement vers SUCCESS
 *    c. Mettre à jour l'escrow vers RELEASED
 *    d. Mettre à jour la mission vers COMPLETED
 *    e.Notifier le worker
 */
export class ReleaseEscrowUseCase {
    paymentRepository;
    missionRepository;
    paytechService;
    escrowDomainService;
    notificationService;
    constructor(paymentRepository, missionRepository, paytechService, escrowDomainService, notificationService) {
        this.paymentRepository = paymentRepository;
        this.missionRepository = missionRepository;
        this.paytechService = paytechService;
        this.escrowDomainService = escrowDomainService;
        this.notificationService = notificationService;
    }
    /**
     * Exécute la libération de l'escrow
     */
    async execute(input) {
        // 1. Vérifier que la mission existe
        const mission = await this.missionRepository.findById(input.missionId);
        if (!mission) {
            throw BusinessErrors.notFound('Mission introuvable.');
        }
        // 2. Vérifier que la mission est en cours
        if (mission.status !== MissionStatus.IN_PROGRESS) {
            throw BusinessErrors.badRequest(`La mission n'est pas en cours. Statut actuel: ${mission.status}`);
        }
        // 3. Vérifier les droits de l'utilisateur
        if (input.role === 'CLIENT' && mission.clientId !== input.userId) {
            throw BusinessErrors.forbidden('Vous n\'êtes pas le client de cette mission.');
        }
        if (input.role === 'WORKER' && mission.workerId !== input.userId) {
            throw BusinessErrors.forbidden('Vous n\'êtes pas le worker de cette mission.');
        }
        // 4. Récupérer l'escrow
        const escrow = await this.paymentRepository.findEscrowByMissionId(input.missionId);
        if (!escrow) {
            throw BusinessErrors.notFound('Escrow introuvable pour cette mission.');
        }
        // 5. Vérifier que l'escrow est en attente (HELD)
        if (escrow.status !== EscrowStatus.HELD) {
            throw BusinessErrors.badRequest(`L'escrow n'est pas en attente de libération. Statut actuel: ${escrow.status}`);
        }
        // 6. Marquer la confirmation
        let bothConfirmed = false;
        if (input.role === 'CLIENT') {
            const updatedMission = await this.missionRepository.markClientConfirmed(input.missionId);
            bothConfirmed = updatedMission.clientConfirmed && updatedMission.workerConfirmed;
        }
        else {
            const updatedMission = await this.missionRepository.markWorkerConfirmed(input.missionId);
            bothConfirmed = updatedMission.clientConfirmed && updatedMission.workerConfirmed;
        }
        // 7. Si les deux ont confirmé, libérer les fonds
        if (bothConfirmed) {
            // Récupérer le payment
            const payment = await this.paymentRepository.findPaymentByMissionId(input.missionId);
            if (!payment) {
                throw BusinessErrors.notFound('Paiement introuvable pour cette mission.');
            }
            try {
                // Libérer les fonds via le service de domaine avec traçabilité
                const { workerAmount, commissionAmount, escrow: releasedEscrow } = this.escrowDomainService.releaseFunds(escrow);
                // Mettre à jour le payment vers SUCCESS
                const updatedPayment = this.escrowDomainService.markPaymentSuccess(payment, 'release-completed');
                // Sauvegarder les mises à jour avec optimistic locking
                // La version est vérifiée atomiquement par Prisma
                await this.paymentRepository.updateAfterRelease(payment.id, escrow.id, updatedPayment, releasedEscrow, escrow.version // Optimistic locking: vérifier la version
                );
                // Mettre à jour le statut de la mission vers COMPLETED
                await this.missionRepository.updateStatus(input.missionId, MissionStatus.COMPLETED);
                // Notifier le worker du paiement libéré
                await this.notificationService.notifyPaymentReleased({
                    paymentId: payment.id,
                    missionId: input.missionId,
                    userId: mission.workerId,
                    amount: workerAmount.toString(),
                });
                return {
                    success: true,
                    missionStatus: MissionStatus.COMPLETED,
                    workerAmount,
                    commissionAmount,
                    message: 'Mission terminée. Les fonds ont été libérés au worker.',
                };
            }
            catch (error) {
                // Gérer le conflit de version (optimistic locking failure)
                if (error.message?.includes('version') || error.code === 'P2025') {
                    throw BusinessErrors.badRequest('Les fonds ont déjà été libérés par une autre transaction. Veuillez rafraîchir la page.');
                }
                throw error;
            }
        }
        // 8. Si pas encore les deux confirmations
        return {
            success: true,
            missionStatus: mission.status,
            workerAmount: 0,
            commissionAmount: 0,
            message: `Confirmation enregistrée. En attente de la confirmation ${input.role === 'CLIENT' ? 'du worker' : 'du client'}.`,
        };
    }
}
//# sourceMappingURL=ReleaseEscrowUseCase.js.map