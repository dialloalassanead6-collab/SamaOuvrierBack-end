// Use Cases Layer - Get Users Use Case

import type { IUserRepository } from './user.repository.interface.js';
import type { UserResponse } from '../domain/index.js';

/**
 * Get Users Use Case
 */
export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case
   * @param skip - Number of records to skip (calculated from page in controller)
   * @param take - Number of records to take (pageSize)
   */
  async execute(skip: number = 0, take: number = 10): Promise<{ users: UserResponse[]; total: number }> {
    const { users, total } = await this.userRepository.findAll(skip, take);

    return {
      users: users.map((user) => user.toResponse()),
      total,
    };
  }
}
