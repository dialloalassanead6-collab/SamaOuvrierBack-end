// ============================================================================
// APPLICATION LAYER - Unban User Use Case
// ============================================================================
// Use case pour débannir un utilisateur (isBanned = false)
// ============================================================================
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
export class UnbanUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter le débannissement d'un utilisateur
     */
    async execute(input) {
        const { userId } = input;
        // Vérifier que l'utilisateur existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Utilisateur introuvable');
        }
        // Vérifier que l'utilisateur n'est pas déjà débanni
        if (!user.isBanned) {
            throw new Error('L\'utilisateur n\'est pas banni');
        }
        // Débannir l'utilisateur
        const unbannedUser = await this.userRepository.unbanUser(userId);
        return {
            user: unbannedUser,
            message: 'Utilisateur débanni avec succès',
        };
    }
}
//# sourceMappingURL=unban-user.usecase.js.map