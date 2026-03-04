// ============================================================================
// USE CASE: Approuver un travailleur
// ============================================================================
// Ce use case permet à l'admin d'approuver un travailleur en attente.
// ============================================================================
import { Role, WorkerStatus } from '@prisma/client';
import { BusinessError } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES, HTTP_STATUS, ERROR_CODES } from '../../../shared/constants/messages.js';
import { NotificationService } from '../../notification/index.js';
/**
 * Use case pour approuver un travailleur
 *
 * RESPONSABILITÉS:
 * - Vérifier que le travailleur existe
 * - Vérifier que l'utilisateur est un travailleur (role = WORKER)
 * - Vérifier que le travailleur est en attente (workerStatus = PENDING)
 * - Approuver le travailleur (workerStatus = APPROVED)
 * - Réinitialiser rejectionReason à null
 * -Notifier le worker de la validation
 */
export class ApproveWorkerUseCase {
    userRepository;
    notificationService;
    constructor(userRepository, notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }
    /**
     * Exécuter le use case
     */
    async execute(input) {
        const { workerId } = input;
        // Vérifier que l'ID est fourni
        if (!workerId) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                code: ERROR_CODES.INVALID_INPUT,
            });
        }
        // Récupérer le travailleur
        const worker = await this.userRepository.findById(workerId);
        // Vérifier que le travailleur existe
        if (!worker) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
                statusCode: HTTP_STATUS.NOT_FOUND,
                code: ERROR_CODES.NOT_FOUND,
            });
        }
        // Vérifier que c'est un travailleur
        if (worker.role !== Role.WORKER) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                code: ERROR_CODES.INVALID_INPUT,
            });
        }
        // Vérifier qu'il est en attente
        if (worker.workerStatus !== WorkerStatus.PENDING) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_PENDING,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                code: ERROR_CODES.INVALID_INPUT,
            });
        }
        // Approuver le travailleur
        const updatedWorker = await this.userRepository.updateWorkerStatus(workerId, WorkerStatus.APPROVED, null);
        // Notifier le worker de la validation de son compte
        try {
            await this.notificationService.notifyAccountValidated({
                userId: workerId,
            });
        }
        catch (notificationError) {
            // Log l'erreur mais ne pas bloquer l'approbation
            console.error('Erreur lors de l\'envoi de la notification:', notificationError);
        }
        return {
            user: updatedWorker,
            message: WORKER_VALIDATION_MESSAGES.WORKER_APPROVED,
        };
    }
}
//# sourceMappingURL=approve-worker.usecase.js.map