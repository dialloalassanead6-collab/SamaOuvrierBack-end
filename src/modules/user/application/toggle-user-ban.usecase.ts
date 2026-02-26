// ============================================================================
// APPLICATION LAYER - Toggle User Ban Use Case (Admin)
// ============================================================================
// Use case pour bannir / débannir un utilisateur (admin only)
// ============================================================================

import type { IUserRepository } from './index.js';
import type { User } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { USER_MESSAGES } from '../../../shared/constants/index.js';

/**
 * Input DTO pour ToggleUserBanUseCase
 */
export interface ToggleUserBanInput {
  userId: string;
  /** Action à effectuer: 'ban' | 'unban' */
  action: 'ban' | 'unban';
}

/**
 * Output DTO pour ToggleUserBanUseCase
 */
export interface ToggleUserBanOutput {
  user: User;
  message: string;
  isBanned: boolean;
}

/**
 * Toggle User Ban Use Case
 * 
 * RESPONSABILITÉS:
 * - Bannir ou débannir un utilisateur (admin only)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas soft-deleted
 * 
 * RÈGLES MÉTIER:
 * - ADMIN peut bannir/débannir n'importe quel utilisateur
 * - Impossible de modifier un utilisateur supprimé (deletedAt != null)
 * 
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export class ToggleUserBanUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Exécuter le bannissement/débannissement d'un utilisateur
   */
  async execute(input: ToggleUserBanInput): Promise<ToggleUserBanOutput> {
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
    let updatedUser: User;

    if (action === 'ban') {
      // Si déjà banni, ne rien faire
      if (user.isBanned) {
        throw BusinessErrors.badRequest(USER_MESSAGES.USER_ALREADY_BANNED);
      }
      updatedUser = await this.userRepository.banUser(userId);
    } else {
      // Si pas banni, ne rien faire
      if (!user.isBanned) {
        throw BusinessErrors.badRequest(USER_MESSAGES.USER_ALREADY_UNBANNED);
      }
      updatedUser = await this.userRepository.unbanUser(userId);
    }

    return {
      user: updatedUser,
      message: action === 'ban' 
        ? USER_MESSAGES.USER_BANNED 
        : USER_MESSAGES.USER_UNBANNED,
      isBanned: updatedUser.isBanned,
    };
  }
}
