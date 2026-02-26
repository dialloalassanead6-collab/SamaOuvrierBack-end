// ============================================================================
// APPLICATION LAYER - Restore User Use Case
// ============================================================================
// Use case pour restaurer un utilisateur soft deleted (deletedAt = null)
// ============================================================================

import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';

/**
 * Input DTO pour RestoreUserUseCase
 */
export interface RestoreUserInput {
  userId: string;
}

/**
 * Output DTO pour RestoreUserUseCase
 */
export interface RestoreUserOutput {
  user: User;
  message: string;
}

/**
 * Restore User Use Case
 * 
 * RESPONSABILITÉS:
 * - Restaurer un utilisateur soft deleted (deletedAt = null)
 * - Vérifier que l'utilisateur existe
 * - Vérifier que l'utilisateur est bien soft deleted
 * 
 * DÉPENDANCES:
 * - IUserRepository: pour accéder aux données utilisateur
 */
export class RestoreUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Exécuter la restauration d'un utilisateur
   */
  async execute(input: RestoreUserInput): Promise<RestoreUserOutput> {
    const { userId } = input;

    // Pour restaurer, on doit chercher l'utilisateur sans filtrer par deletedAt
    // car l'utilisateur soft deleted n'est pas trouvé par findById standard
    const user = await this.userRepository.findByIdIncludingDeleted(userId);
    
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    // Vérifier que l'utilisateur est bien soft deleted
    if (user.deletedAt === null) {
      throw new Error('L\'utilisateur n\'est pas soft deleted');
    }

    // Restaurer l'utilisateur
    const restoredUser = await this.userRepository.restoreUser(userId);

    return {
      user: restoredUser,
      message: 'Utilisateur restauré avec succès',
    };
  }
}
