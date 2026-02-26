// Use Cases Layer - Get User By ID Use Case

import type { IUserRepository } from './user.repository.interface.js';
import type { UserResponse } from '../domain/index.js';

/**
 * Get User By ID Use Case
 */
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case
   */
  async execute(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user.toResponse();
  }
}
