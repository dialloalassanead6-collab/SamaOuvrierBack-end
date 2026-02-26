import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Input DTO pour DeactivateUserUseCase
 */
export interface DeactivateUserInput {
    userId: string;
}
/**
 * Output DTO pour DeactivateUserUseCase
 */
export interface DeactivateUserOutput {
    user: User;
    message: string;
}
/**
 * Deactivate User Use Case
 *
 * RESPONSABILITÉS:
 * - Désactiver un utilisateur actif (isActive = false)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà désactivé
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class DeactivateUserUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter la désactivation d'un utilisateur
     */
    execute(input: DeactivateUserInput): Promise<DeactivateUserOutput>;
}
//# sourceMappingURL=deactivate-user.usecase.d.ts.map