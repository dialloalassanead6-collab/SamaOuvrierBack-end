import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Input DTO pour get-my-profile
 */
export interface GetMyProfileInput {
    /** ID du worker (extrait du JWT) */
    workerId: string;
}
/**
 * Output DTO pour get-my-profile
 */
export interface GetMyProfileOutput {
    /** Utilisateur trouvé */
    user: User;
}
/**
 * Use Case: Obtenir le profil du worker connecté
 *
 * RESPONSABILITÉS:
 * - Vérifier que le worker existe
 * - Vérifier que l'utilisateur est un worker (role = WORKER)
 * - Vérifier que le compte n'est pas soft-deleted
 * - Retourner le profil du worker
 *
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 */
export declare class GetMyProfileUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le use case
     */
    execute(input: GetMyProfileInput): Promise<GetMyProfileOutput>;
}
//# sourceMappingURL=get-my-profile.usecase.d.ts.map