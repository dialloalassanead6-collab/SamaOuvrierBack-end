// ============================================================================
// APPLICATION LAYER - Toggle User Activation Use Case (Admin)
// ============================================================================
// Use case pour activer/désactiver n'importe quel utilisateur (admin only)
// ============================================================================
import { BusinessErrors } from '../../../shared/errors/index.js';
import { USER_MESSAGES } from '../../../shared/constants/index.js';
/**
 * Toggle User Activation Use Case
 *
 * RESPONSABILITÉS:
 * - Activer ou désactiver n'importe quel utilisateur (admin only)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas soft-deleted
 * - Ne touche pas à isBanned
 *
 * RÈGLES MÉTIER:
 * - Impossible de modifier un utilisateur supprimé (deletedAt != null)
 * - ADMIN peut activer/désactiver n'importe quel utilisateur
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export class ToggleUserActivationUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter l'activation/désactivation d'un utilisateur
     */
    async execute(input) {
        const { userId, action } = input;
        // 1. Vérifier que l'utilisateur existe (y compris soft-deleted pour les admins)
        const user = await this.userRepository.findByIdIncludingDeleted(userId);
        if (!user) {
            throw BusinessErrors.notFound(USER_MESSAGES.USER_NOT_FOUND);
        }
        // 2. Vérifier que l'utilisateur n'est pas soft-deleted
        if (user.deletedAt !== null) {
            throw BusinessErrors.badRequest(USER_MESSAGES.CANNOT_MODIFY_DELETED, {
                reason: 'USER_SOFT_DELETED',
            });
        }
        // 3. Effectuer l'action demandée
        let updatedUser;
        if (action === 'activate') {
            // Si déjà actif, ne rien faire
            if (user.isActive) {
                throw BusinessErrors.badRequest(USER_MESSAGES.USER_ALREADY_ACTIVE);
            }
            updatedUser = await this.userRepository.activateUser(userId);
        }
        else {
            // Si déjà inactif, ne rien faire
            if (!user.isActive) {
                throw BusinessErrors.badRequest(USER_MESSAGES.USER_ALREADY_INACTIVE);
            }
            updatedUser = await this.userRepository.deactivateUser(userId);
        }
        return {
            user: updatedUser,
            message: action === 'activate'
                ? USER_MESSAGES.USER_ACTIVATED
                : USER_MESSAGES.USER_DEACTIVATED,
            isActive: updatedUser.isActive,
        };
    }
}
//# sourceMappingURL=toggle-user-activation.usecase.js.map