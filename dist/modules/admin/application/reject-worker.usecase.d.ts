import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Paramètres d'entrée pour le use case RejectWorker
 */
export interface RejectWorkerInput {
    /** ID du travailleur à rejeter */
    workerId: string;
    /** Raison du rejet (obligatoire) */
    rejectionReason: string;
}
/**
 * Résultat du use case RejectWorker
 */
export interface RejectWorkerOutput {
    /** Utilisateur rejeté */
    user: User;
    /** Message de succès */
    message: string;
}
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
export declare class RejectWorkerUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le use case
     */
    execute(input: RejectWorkerInput): Promise<RejectWorkerOutput>;
}
//# sourceMappingURL=reject-worker.usecase.d.ts.map