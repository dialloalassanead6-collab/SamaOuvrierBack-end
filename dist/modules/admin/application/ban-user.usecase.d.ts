import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Input DTO pour BanUserUseCase
 */
export interface BanUserInput {
    userId: string;
}
/**
 * Output DTO pour BanUserUseCase
 */
export interface BanUserOutput {
    user: User;
    message: string;
}
/**
 * Ban User Use Case
 *
 * RESPONSABILITÉS:
 * - Bannir un utilisateur (isBanned = true)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà banni
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class BanUserUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le bannissement d'un utilisateur
     */
    execute(input: BanUserInput): Promise<BanUserOutput>;
}
//# sourceMappingURL=ban-user.usecase.d.ts.map