import type { IUserRepository } from './index.js';
import type { User } from '../domain/index.js';
/**
 * Input DTO pour ToggleUserBanUseCase
 */
export interface ToggleUserBanInput {
    userId: string;
    /** Action à effectuer: 'ban' | 'unban' */
    action: 'ban' | 'unban';
}
/**
 * Output DTO pour ToggleUserBanUseCase
 */
export interface ToggleUserBanOutput {
    user: User;
    message: string;
    isBanned: boolean;
}
/**
 * Toggle User Ban Use Case
 *
 * RESPONSABILITÉS:
 * - Bannir ou débannir un utilisateur (admin only)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas soft-deleted
 *
 * RÈGLES MÉTIER:
 * - ADMIN peut bannir/débannir n'importe quel utilisateur
 * - Impossible de modifier un utilisateur supprimé (deletedAt != null)
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class ToggleUserBanUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le bannissement/débannissement d'un utilisateur
     */
    execute(input: ToggleUserBanInput): Promise<ToggleUserBanOutput>;
}
//# sourceMappingURL=toggle-user-ban.usecase.d.ts.map