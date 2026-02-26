import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Input DTO pour UnbanUserUseCase
 */
export interface UnbanUserInput {
    userId: string;
}
/**
 * Output DTO pour UnbanUserUseCase
 */
export interface UnbanUserOutput {
    user: User;
    message: string;
}
/**
 * Unban User Use Case
 *
 * RESPONSABILITÉS:
 * - Débannir un utilisateur (isBanned = false)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà débanni
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export declare class UnbanUserUseCase {
    private userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le débannissement d'un utilisateur
     */
    execute(input: UnbanUserInput): Promise<UnbanUserOutput>;
}
//# sourceMappingURL=unban-user.usecase.d.ts.map