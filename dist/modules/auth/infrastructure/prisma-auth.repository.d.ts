import { PrismaClient } from '@prisma/client';
import type { IAuthRepository, CreateUserData } from '../application/index.js';
import type { UserWithPassword, RegisteredUser, ProfessionEntity } from '../domain/index.js';
/**
 * Prisma Auth Repository
 *
 * RESPONSABILITIES:
 * - Implement IAuthRepository interface
 * - Handle all authentication-related database operations
 * - Convert between Prisma models and domain types
 *
 * Following Dependency Inversion Principle:
 * - The interface is defined in the application layer
 * - This implementation is in the infrastructure layer
 * - Services depend on the abstraction, not the implementation
 */
export declare class PrismaAuthRepository implements IAuthRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * Find user by email including password hash
     */
    findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
    /**
     * Find user by ID (without password)
     */
    findById(id: string): Promise<RegisteredUser | null>;
    /**
     * Check if email already exists
     */
    existsByEmail(email: string): Promise<boolean>;
    /**
     * Create a new user with hashed password
     */
    createUser(data: CreateUserData): Promise<RegisteredUser>;
    /**
     * Find profession by ID
     */
    findProfessionById(id: string): Promise<ProfessionEntity | null>;
    /**
     * Check if any profession exists in database
     */
    hasAnyProfession(): Promise<boolean>;
}
export declare const authRepository: PrismaAuthRepository;
//# sourceMappingURL=prisma-auth.repository.d.ts.map