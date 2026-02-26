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
export declare class AddUserUseCase {
    private readonly userRepository;
    private readonly passwordService;
    constructor(userRepository: IUserRepository, passwordService: IPasswordService);
    /**
     * Execute the use case
     *
     * @param input - User creation input
     * @param role - User role (defaults to CLIENT)
     * @returns Created user response
     */
    execute(input: CreateUserInput, role?: Role): Promise<UserResponse>;
}
//# sourceMappingURL=add-user.usecase.d.ts.map