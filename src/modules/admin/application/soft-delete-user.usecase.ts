// ============================================================================
// APPLICATION LAYER - Soft Delete User Use Case
// ============================================================================
// Use case pour soft delete un utilisateur (deletedAt = now)
// ============================================================================

import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';

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
}

/**
 * Soft Delete User Use Case
 * 
 * RESPONSABILITÉS:
 * - Soft delete un utilisateur (deletedAt = date actuelle)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà soft deleted
 * 
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export class SoftDeleteUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Exécuter le soft delete d'un utilisateur
   */
  async execute(input: SoftDeleteUserInput): Promise<SoftDeleteUserOutput> {
    const { userId } = input;

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Vérifier que l'utilisateur n'est pas déjà soft deleted
    if (user.deletedAt !== null) {
      throw new Error('L\'utilisateur est déjà soft deleted');
    }

    // Soft delete l'utilisateur
    const deletedUser = await this.userRepository.softDeleteUser(userId);

    return {
      user: deletedUser,
      message: 'Utilisateur soft deleted avec succès',
    };
  }
}
