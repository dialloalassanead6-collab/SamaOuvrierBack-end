// ============================================================================
// USE CASE: Rejeter un travailleur
// ============================================================================
// Ce use case permet à l'admin de rejeter un travailleur en attente.
// ============================================================================
import { Role, WorkerStatus } from '@prisma/client';
import { BusinessError } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES, HTTP_STATUS, ERROR_CODES } from '../../../shared/constants/messages.js';
/**
 * Use case pour rejeter un travailleur
 *
 * RESPONSABILITÉS:
 * - Vérifier que le travailleur existe
 * - Vérifier que l'utilisateur est un travailleur (role = WORKER)
 * - Vérifier que le travailleur est en attente (workerStatus = PENDING)
 * - Vérifier que la raison du rejet est fournie
 * - Rejeter le travailleur (workerStatus = REJECTED)
 * - Enregistrer la raison du rejet
 */
export class RejectWorkerUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter le use case
     */
    async execute(input) {
        const { workerId, rejectionReason } = input;
        // Vérifier que l'ID est fourni
        if (!workerId) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                code: ERROR_CODES.INVALID_INPUT,
            });
        }
        // Vérifier que la raison du rejet est fournie
        if (!rejectionReason || rejectionReason.trim().length === 0) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.REJECTION_REASON_REQUIRED,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                code: ERROR_CODES.INVALID_INPUT,
            });
        }
        // Vérifier que la raison du rejet n'est pas trop longue (1000 caractères)
        if (rejectionReason.length > 1000) {
            throw new BusinessError({
                message: WORKER_VALIDATION_MESSAGES.REJECTION_REASON_TOO_LONG,
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
        // Rejeter le travailleur avec la raison
        const updatedWorker = await this.userRepository.updateWorkerStatus(workerId, WorkerStatus.REJECTED, rejectionReason.trim());
        return {
            user: updatedWorker,
            message: WORKER_VALIDATION_MESSAGES.WORKER_REJECTED,
        };
    }
}
//# sourceMappingURL=reject-worker.usecase.js.map