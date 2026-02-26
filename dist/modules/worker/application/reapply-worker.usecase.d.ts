import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Paramètres d'entrée pour le use case ReapplyWorker
 */
export interface ReapplyWorkerInput {
    /** ID du travailleur qui fait la demande (extrait du JWT) */
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
 * - Vérifier que le travailleur n'est pas banni (isBanned = false)
 * - Vérifier que le compte n'est pas soft-deleted (deletedAt = null)
 * - Vérifier que le travailleur est rejeté (workerStatus = REJECTED)
 * - Remettre le travailleur en attente (workerStatus = PENDING)
 * - Réinitialiser rejectionReason à null
 *
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 * - Toutes les conditions d'accès sont vérifiées AVANT toute modification
 */
export declare class ReapplyWorkerUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le use case
     *
     * Ordre des vérifications (du plus simple au plus complexe):
     * 1. Validation basique de l'input
     * 2. Existence du worker
     * 3. Vérification du rôle
     * 4. Vérifications de sécurité (banni, supprimé)
     * 5. Vérification du statut actuel
     */
    execute(input: ReapplyWorkerInput): Promise<ReapplyWorkerOutput>;
}
//# sourceMappingURL=reapply-worker.usecase.d.ts.map