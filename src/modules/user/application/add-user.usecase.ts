// Use Cases Layer - Add User Use Case

import { Role } from '@prisma/client';
import type { IUserRepository } from './user.repository.interface.js';
import type { UserResponse, CreateUserInput } from '../domain/index.js';
import type { IPasswordService } from '../../../shared/security/password.service.js';

/**
 * Add User Use Case
 * 
 * RESPONSABILITIES:
 * - Encapsulate the business logic for creating a user
 * - Hash password before saving (never store plain text passwords)
 * - Coordinate between different services (password hashing, etc.)
 * - Be independent of HTTP frameworks and database
 * 
 * SOLID Principles:
 * - SRP: Single responsibility - only handles user creation
 * - DIP: Depends on IUserRepository interface and IPasswordService (abstractions)
 * - OCP: Can be extended without modifying existing code
 */
export class AddUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService
  ) {}

  /**
   * Execute the use case
   * 
   * @param input - User creation input
   * @param role - User role (defaults to CLIENT)
   * @returns Created user response
   */
  async execute(input: CreateUserInput, role: Role = Role.CLIENT): Promise<UserResponse> {
    // Business rule: Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(input.email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // SECURITY: Always hash password before storing
    // Never store plain text passwords
    const hashedPassword = await this.passwordService.hash(input.password);

    // Create user with hashed password and specified role
    const user = await this.userRepository.create({
      ...input,
      password: hashedPassword,
      role,
    });

    return user.toResponse();
  }
}
