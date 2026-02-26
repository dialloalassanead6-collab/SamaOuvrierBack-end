import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Input DTO pour SoftDeleteUserUseCase
 */
export interface SoftDeleteUserInput {
    userId: string;
}
/**
 * Output DTO pour SoftDeleteUserUseCase
 */
export interface SoftDeleteUserOutput {
    user: User;
    message: string;
}
/**
 * Soft Delete User Use Case
 *
 * RESPONSABILITÉS:
 * - Soft delete un utilisateur (deletedAt = date actuelle)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà soft deleted
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class SoftDeleteUserUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le soft delete d'un utilisateur
     */
    execute(input: SoftDeleteUserInput): Promise<SoftDeleteUserOutput>;
}
//# sourceMappingURL=soft-delete-user.usecase.d.ts.map