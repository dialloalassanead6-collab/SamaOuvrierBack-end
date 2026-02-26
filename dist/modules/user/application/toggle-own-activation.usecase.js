// ============================================================================
// APPLICATION LAYER - Toggle Own Activation Use Case
// ============================================================================
// Use case pour qu'un utilisateur active/désactive SON propre compte
// ============================================================================
import { BusinessErrors } from '../../../shared/errors/index.js';
import { USER_MESSAGES } from '../../../shared/constants/index.js';
/**
 * Toggle Own Activation Use Case
 *
 * RESPONSABILITÉS:
 * - Permettre à un utilisateur d'activer/désactiver son propre compte
 * - Vérifier que l'utilisateur n'est pas banni
 * - Vérifier que l'utilisateur n'est pas soft-deleted
 * - Vérifier que c'est bien le même utilisateur
 *
 * RÈGLES MÉTIER:
 * - Un utilisateur ne peut modifier que son propre compte
 * - Si isBanned = true → action interdite
 * - Si deletedAt != null → action interdite
 *
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export class ToggleOwnActivationUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter l'activation/désactivation de son propre compte
     */
    async execute(input) {
        const { currentUserId, action } = input;
        // 1. Récupérer l'utilisateur actuel
        const user = await this.userRepository.findById(currentUserId);
        if (!user) {
            throw BusinessErrors.notFound(USER_MESSAGES.USER_NOT_FOUND);
        }
        // 2. Vérifier que l'utilisateur n'est pas banni
        // RÈGLE: Un utilisateur banni ne peut pas modifier son propre compte
        if (user.isBanned) {
            throw BusinessErrors.forbidden(USER_MESSAGES.CANNOT_MODIFY_SELF_BANNED);
        }
        // 3. Vérifier que l'utilisateur n'est pas soft-deleted
        // Note: findById ne retourne pas les utilisateurs supprimés, donc c'est covered
        if (user.deletedAt !== null) {
            throw BusinessErrors.badRequest(USER_MESSAGES.CANNOT_MODIFY_DELETED);
        }
        // 4. Effectuer l'action demandée
        let updatedUser;
        if (action === 'activate') {
            // Si déjà actif, ne rien faire
            if (user.isActive) {
                throw BusinessErrors.badRequest(USER_MESSAGES.USER_ALREADY_ACTIVE);
            }
            updatedUser = await this.userRepository.activateUser(currentUserId);
        }
        else {
            // Si déjà inactif, ne rien faire
            if (!user.isActive) {
                throw BusinessErrors.badRequest(USER_MESSAGES.USER_ALREADY_INACTIVE);
            }
            updatedUser = await this.userRepository.deactivateUser(currentUserId);
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
//# sourceMappingURL=toggle-own-activation.usecase.js.map