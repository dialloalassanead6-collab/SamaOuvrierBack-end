import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
import { NotificationService } from '../../notification/index.js';
/**
 * Paramètres d'entrée pour le use case ApproveWorker
 */
export interface ApproveWorkerInput {
    /** ID du travailleur à approuver */
    workerId: string;
}
/**
 * Résultat du use case ApproveWorker
 */
export interface ApproveWorkerOutput {
    /** Utilisateur approuvé */
    user: User;
    /** Message de succès */
    message: string;
}
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
export declare class ApproveWorkerUseCase {
    private readonly userRepository;
    private readonly notificationService;
    constructor(userRepository: IUserRepository, notificationService: NotificationService);
    /**
     * Exécuter le use case
     */
    execute(input: ApproveWorkerInput): Promise<ApproveWorkerOutput>;
}
//# sourceMappingURL=approve-worker.usecase.d.ts.map