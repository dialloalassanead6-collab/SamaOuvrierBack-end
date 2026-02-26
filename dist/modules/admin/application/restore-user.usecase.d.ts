import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Input DTO pour RestoreUserUseCase
 */
export interface RestoreUserInput {
    userId: string;
}
/**
 * Output DTO pour RestoreUserUseCase
 */
export interface RestoreUserOutput {
    user: User;
    message: string;
}
/**
 * Restore User Use Case
 *
 * RESPONSABILITÉS:
 * - Restaurer un utilisateur soft deleted (deletedAt = null)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur est bien soft deleted
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class RestoreUserUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter la restauration d'un utilisateur
     */
    execute(input: RestoreUserInput): Promise<RestoreUserOutput>;
}
//# sourceMappingURL=restore-user.usecase.d.ts.map