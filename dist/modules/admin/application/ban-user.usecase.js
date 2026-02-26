// ============================================================================
// APPLICATION LAYER - Ban User Use Case
// ============================================================================
// Use case pour bannir un utilisateur (isBanned = true)
// ============================================================================
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
export class BanUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter le bannissement d'un utilisateur
     */
    async execute(input) {
        const { userId } = input;
        // Vérifier que l'utilisateur existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Utilisateur introuvable');
        }
        // Vérifier que l'utilisateur n'est pas déjà banni
        if (user.isBanned) {
            throw new Error('L\'utilisateur est déjà banni');
        }
        // Bannir l'utilisateur
        const bannedUser = await this.userRepository.banUser(userId);
        return {
            user: bannedUser,
            message: 'Utilisateur banni avec succès',
        };
    }
}
//# sourceMappingURL=ban-user.usecase.js.map