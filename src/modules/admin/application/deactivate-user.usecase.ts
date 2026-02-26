// ============================================================================
// APPLICATION LAYER - Deactivate User Use Case
// ============================================================================
// Use case pour désactiver un utilisateur (isActive = false)
// ============================================================================

import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';

/**
 * Input DTO pour DeactivateUserUseCase
 */
export interface DeactivateUserInput {
  userId: string;
}

/**
 * Output DTO pour DeactivateUserUseCase
 */
export interface DeactivateUserOutput {
  user: User;
  message: string;
}

/**
 * Deactivate User Use Case
 * 
 * RESPONSABILITÉS:
 * - Désactiver un utilisateur actif (isActive = false)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà désactivé
 * 
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export class DeactivateUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Exécuter la désactivation d'un utilisateur
   */
  async execute(input: DeactivateUserInput): Promise<DeactivateUserOutput> {
    const { userId } = input;

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Vérifier que l'utilisateur n'est pas déjà désactivé
    if (!user.isActive) {
      throw new Error('L\'utilisateur est déjà désactivé');
    }

    // Désactiver l'utilisateur
    const deactivatedUser = await this.userRepository.deactivateUser(userId);

    return {
      user: deactivatedUser,
      message: 'Utilisateur désactivé avec succès',
    };
  }
}
