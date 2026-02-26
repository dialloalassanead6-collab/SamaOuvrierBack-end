// Use Cases Layer - Delete User Use Case
// Now uses soft delete by default

import type { IUserRepository } from './user.repository.interface.js';
import type { User } from '../domain/index.js';

/**
 * Delete User Use Case
 * 
 * Now performs soft delete by default (sets deletedAt to current date)
 */
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case - soft delete
   */
  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already soft deleted
    if (user.deletedAt !== null) {
      throw new Error('User is already deleted');
    }

    // Perform soft delete
    const deletedUser = await this.userRepository.softDeleteUser(id);
    return deletedUser;
  }
}
