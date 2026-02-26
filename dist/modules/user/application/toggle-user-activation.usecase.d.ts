import type { IUserRepository } from './index.js';
import type { User } from '../domain/index.js';
/**
 * Input DTO pour ToggleUserActivationUseCase
 */
export interface ToggleUserActivationInput {
    userId: string;
    /** Action à effectuer: 'activate' | 'deactivate' */
    action: 'activate' | 'deactivate';
}
/**
 * Output DTO pour ToggleUserActivationUseCase
 */
export interface ToggleUserActivationOutput {
    user: User;
    message: string;
    isActive: boolean;
}
/**
 * Toggle User Activation Use Case
 *
 * RESPONSABILITÉS:
 * - Activer ou désactiver n'importe quel utilisateur (admin only)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas soft-deleted
 * - Ne touche pas à isBanned
 *
 * RÈGLES MÉTIER:
 * - Impossible de modifier un utilisateur supprimé (deletedAt != null)
 * - ADMIN peut activer/désactiver n'importe quel utilisateur
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class ToggleUserActivationUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter l'activation/désactivation d'un utilisateur
     */
    execute(input: ToggleUserActivationInput): Promise<ToggleUserActivationOutput>;
}
//# sourceMappingURL=toggle-user-activation.usecase.d.ts.map