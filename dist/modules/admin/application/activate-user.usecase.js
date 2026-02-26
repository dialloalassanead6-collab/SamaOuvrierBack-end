// ============================================================================
// APPLICATION LAYER - Activate User Use Case
// ============================================================================
// Use case pour activer un utilisateur (isActive = true)
// ============================================================================
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
export class ActivateUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter l'activation d'un utilisateur
     */
    async execute(input) {
        const { userId } = input;
        // Vérifier que l'utilisateur existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Utilisateur introuvable');
        }
        // Vérifier que l'utilisateur n'est pas déjà actif
        if (user.isActive) {
            throw new Error('L\'utilisateur est déjà actif');
        }
        // Activer l'utilisateur
        const activatedUser = await this.userRepository.activateUser(userId);
        return {
            user: activatedUser,
            message: 'Utilisateur activé avec succès',
        };
    }
}
//# sourceMappingURL=activate-user.usecase.js.map