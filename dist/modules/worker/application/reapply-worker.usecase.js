// ============================================================================
// USE CASE: Refaire une demande de validation (Reapply)
// ============================================================================
// Ce use case permet à un travailleur rejeté de refaire une demande.
// ============================================================================
import { Role, WorkerStatus } from '@prisma/client';
import { BusinessError } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES, HTTP_STATUS, ERROR_CODES } from '../../../shared/constants/messages.js';
/**
 * Use case pour refaire une demande de validation
 *
 * RESPONSABILITÉS:
 * - Vérifier que le travailleur existe
 * - Vérifier que l'utilisateur est un travailleur (role = WORKER)
 * - Vérifier que le travailleur est rejeté (workerStatus = REJECTED)
 * - Remettre le travailleur en attente (workerStatus = PENDING)
 * - Réinitialiser rejectionReason à null
 */
export class ReapplyWorkerUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
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
                message: WORKER_VALIDATION_MESSAGES.WORKER_ACCESS_DENIED,
                statusCode: HTTP_STATUS.FORBIDDEN,
                code: ERROR_CODES.FORBIDDEN,
            });
        }
        // Vérifier qu'il a été rejeté (seuls les travailleurs rejetés peuvent refaire une demande)
        if (worker.workerStatus !== WorkerStatus.REJECTED) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_REJECTED,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                code: ERROR_CODES.INVALID_INPUT,
            });
        }
        // Remettre le travailleur en attente
        const updatedWorker = await this.userRepository.updateWorkerStatus(workerId, WorkerStatus.PENDING, null);
        return {
            user: updatedWorker,
            message: WORKER_VALIDATION_MESSAGES.WORKER_REAPPLY_SUCCESS,
        };
    }
}
//# sourceMappingURL=reapply-worker.usecase.js.map