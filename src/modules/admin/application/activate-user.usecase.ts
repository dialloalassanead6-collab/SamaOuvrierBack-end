// ============================================================================
// APPLICATION LAYER - Activate User Use Case
// ============================================================================
// Use case pour activer un utilisateur (isActive = true)
// ============================================================================

import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';

/**
 * Input DTO pour ActivateUserUseCase
 */
export interface ActivateUserInput {
  userId: string;
}

/**
 * Output DTO pour ActivateUserUseCase
 */
export interface ActivateUserOutput {
  user: User;
  message: string;
}

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
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Exécuter l'activation d'un utilisateur
   */
  async execute(input: ActivateUserInput): Promise<ActivateUserOutput> {
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
