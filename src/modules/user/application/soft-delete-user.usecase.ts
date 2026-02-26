// ============================================================================
// APPLICATION LAYER - Soft Delete User Use Case (Admin)
// ============================================================================
// Use case pour soft-delete un utilisateur (admin only)
// ============================================================================

import type { IUserRepository } from './index.js';
import type { User } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { USER_MESSAGES } from '../../../shared/constants/index.js';

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
export class SoftDeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Exécuter le soft delete d'un utilisateur
   */
  async execute(input: SoftDeleteUserInput): Promise<SoftDeleteUserOutput> {
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
      deletedAt: updatedUser.deletedAt!,
    };
  }
}
