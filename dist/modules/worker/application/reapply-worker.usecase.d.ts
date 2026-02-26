import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Paramètres d'entrée pour le use case ReapplyWorker
 */
export interface ReapplyWorkerInput {
    /** ID du travailleur qui fait la demande */
    workerId: string;
}
/**
 * Résultat du use case ReapplyWorker
 */
export interface ReapplyWorkerOutput {
    /** Utilisateur avec le nouveau statut */
    user: User;
    /** Message de succès */
    message: string;
}
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
export declare class ReapplyWorkerUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le use case
     */
    execute(input: ReapplyWorkerInput): Promise<ReapplyWorkerOutput>;
}
//# sourceMappingURL=reapply-worker.usecase.d.ts.map