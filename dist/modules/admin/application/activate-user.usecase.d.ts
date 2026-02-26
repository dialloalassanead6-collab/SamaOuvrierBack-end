import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Input DTO pour ActivateUserUseCase
 */
export interface ActivateUserInput {
    userId: string;
}
/**
 * Output DTO pour ActivateUserUseCase
 */
export interface ActivateUserOutput {
    user: User;
    message: string;
}
/**
 * Activate User Use Case
 *
 * RESPONSABILITÉS:
 * - Activer un utilisateur désactivé (isActive = true)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà actif
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class ActivateUserUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter l'activation d'un utilisateur
     */
    execute(input: ActivateUserInput): Promise<ActivateUserOutput>;
}
//# sourceMappingURL=activate-user.usecase.d.ts.map