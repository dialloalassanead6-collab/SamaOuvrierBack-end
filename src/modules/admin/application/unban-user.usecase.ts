// ============================================================================
// APPLICATION LAYER - Unban User Use Case
// ============================================================================
// Use case pour débannir un utilisateur (isBanned = false)
// ============================================================================

import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';

/**
 * Input DTO pour UnbanUserUseCase
 */
export interface UnbanUserInput {
  userId: string;
}

/**
 * Output DTO pour UnbanUserUseCase
 */
export interface UnbanUserOutput {
  user: User;
  message: string;
}

/**
 * Unban User Use Case
 * 
 * RESPONSABILITÉS:
 * - Débannir un utilisateur (isBanned = false)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur n'est pas déjà débanni
 * 
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export class UnbanUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Exécuter le débannissement d'un utilisateur
   */
  async execute(input: UnbanUserInput): Promise<UnbanUserOutput> {
    const { userId } = input;

    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Vérifier que l'utilisateur n'est pas déjà débanni
    if (!user.isBanned) {
      throw new Error('L\'utilisateur n\'est pas banni');
    }

    // Débannir l'utilisateur
    const unbannedUser = await this.userRepository.unbanUser(userId);

    return {
      user: unbannedUser,
      message: 'Utilisateur débanni avec succès',
    };
  }
}
