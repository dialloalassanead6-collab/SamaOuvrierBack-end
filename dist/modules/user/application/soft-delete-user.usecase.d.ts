import type { IUserRepository } from './index.js';
import type { User } from '../domain/index.js';
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
    deletedAt: Date;
}
/**
 * Soft Delete User Use Case
 *
 * RESPONSABILITÉS:
 * - Effectuer un soft delete d'un utilisateur (admin only)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà soft-deleted
 *
 * RÈGLES MÉTIER:
 * - ADMIN peut soft-delete n'importe quel utilisateur
 * - Met à jour deletedAt avec la date actuelle
 * - Ne supprime pas réellement l'utilisateur (soft delete)
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class SoftDeleteUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le soft delete d'un utilisateur
     */
    execute(input: SoftDeleteUserInput): Promise<SoftDeleteUserOutput>;
}
//# sourceMappingURL=soft-delete-user.usecase.d.ts.map