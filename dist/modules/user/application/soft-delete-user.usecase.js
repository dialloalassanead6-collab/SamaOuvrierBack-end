// ============================================================================
// APPLICATION LAYER - Soft Delete User Use Case (Admin)
// ============================================================================
// Use case pour soft-delete un utilisateur (admin only)
// ============================================================================
import { BusinessErrors } from '../../../shared/errors/index.js';
import { USER_MESSAGES } from '../../../shared/constants/index.js';
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
export class SoftDeleteUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter le soft delete d'un utilisateur
     */
    async execute(input) {
        const { userId } = input;
        // 1. Vérifier que l'utilisateur existe (y compris soft-deleted pour les admins)
        const user = await this.userRepository.findByIdIncludingDeleted(userId);
        if (!user) {
            throw BusinessErrors.notFound(USER_MESSAGES.USER_NOT_FOUND);
        }
        // 2. Vérifier que l'utilisateur n'est pas déjà soft-deleted
        if (user.deletedAt !== null) {
            throw BusinessErrors.badRequest(USER_MESSAGES.USER_ALREADY_DELETED);
        }
        // 3. Effectuer le soft delete
        const updatedUser = await this.userRepository.softDeleteUser(userId);
        return {
            user: updatedUser,
            message: USER_MESSAGES.USER_SOFT_DELETED,
            deletedAt: updatedUser.deletedAt,
        };
    }
}
//# sourceMappingURL=soft-delete-user.usecase.js.map