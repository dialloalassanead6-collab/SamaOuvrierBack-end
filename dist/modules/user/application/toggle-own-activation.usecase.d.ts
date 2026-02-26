import type { IUserRepository } from './index.js';
import type { User } from '../domain/index.js';
/**
 * Input DTO pour ToggleOwnActivationUseCase
 */
export interface ToggleOwnActivationInput {
    /** ID de l'utilisateur qui effectue l'action (from authenticated request) */
    currentUserId: string;
    /** Action à effectuer: 'activate' | 'deactivate' */
    action: 'activate' | 'deactivate';
}
/**
 * Output DTO pour ToggleOwnActivationUseCase
 */
export interface ToggleOwnActivationOutput {
    user: User;
    message: string;
    isActive: boolean;
}
/**
 * Toggle Own Activation Use Case
 *
 * RESPONSABILITÉS:
 * - Permettre à un utilisateur d'activer/désactiver son propre compte
 * - Vérifier que l'utilisateur n'est pas banni
 * - Vérifier que l'utilisateur n'est pas soft-deleted
 * - Vérifier que c'est bien le même utilisateur
 *
 * RÈGLES MÉTIER:
 * - Un utilisateur ne peut modifier que son propre compte
 * - Si isBanned = true → action interdite
 * - Si deletedAt != null → action interdite
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class ToggleOwnActivationUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter l'activation/désactivation de son propre compte
     */
    execute(input: ToggleOwnActivationInput): Promise<ToggleOwnActivationOutput>;
}
//# sourceMappingURL=toggle-own-activation.usecase.d.ts.map