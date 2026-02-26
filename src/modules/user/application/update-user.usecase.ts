// Use Cases Layer - Update User Use Case (continued)

import type { IUserRepository } from './user.repository.interface.js';
import type { UserResponse, UpdateUserInput } from '../domain/index.js';

/**
 * Update User Use Case
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case
   */
  async execute(id: string, input: UpdateUserInput): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Business rule: Check email uniqueness if email is being changed
    if (input.email && input.email !== user.email) {
      const emailExists = await this.userRepository.existsByEmail(input.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, input);
    return updatedUser.toResponse();
  }
}
