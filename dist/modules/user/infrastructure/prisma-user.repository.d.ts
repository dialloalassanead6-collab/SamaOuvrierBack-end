import { PrismaClient, Role, WorkerStatus } from '@prisma/client';
import type { IUserRepository } from '../application/index.js';
import type { CreateUserInput, UpdateUserInput, User } from '../domain/index.js';
/**
 * Prisma User Repository
 *
 * RESPONSABILITIES:
 * - Implement IUserRepository interface
 * - Handle all database operations for User
 * - Convert between Prisma models and Domain entities
 *
 * This follows the Dependency Inversion Principle:
 * - The interface (IUserRepository) is defined in the application layer
 * - This implementation is in the infrastructure layer
 * - Use cases depend on the abstraction, not the implementation
 */
export declare class PrismaUserRepository implements IUserRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * Find user by email (ignores soft deleted users)
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * Find user by ID (ignores soft deleted users)
     */
    findById(id: string): Promise<User | null>;
    /**
     * Find all users with pagination (ignores soft deleted users)
     */
    findAll(skip: number, take: number): Promise<{
        users: User[];
        total: number;
    }>;
    /**
     * Create a new user
     * New users are active by default (isActive: true)
     */
    create(input: CreateUserInput & {
        role?: Role;
    }): Promise<User>;
    /**
     * Update an existing user
     */
    update(id: string, input: UpdateUserInput): Promise<User>;
    /**
     * Delete a user
     */
    delete(id: string): Promise<void>;
    /**
     * Check if email already exists
     */
    existsByEmail(email: string): Promise<boolean>;
    /**
     * Find workers by status (filter for admin)
     * Only returns users with role = WORKER
     */
    findWorkersByStatus(status: WorkerStatus, skip: number, take: number): Promise<{
        users: User[];
        total: number;
    }>;
    /**
     * Find all workers (no filter)
     * Only returns users with role = WORKER
     */
    findAllWorkers(skip: number, take: number): Promise<{
        users: User[];
        total: number;
    }>;
    /**
     * Update worker status (approve or reject)
     */
    updateWorkerStatus(id: string, status: WorkerStatus, rejectionReason?: string | null): Promise<User>;
    /**
     * Activate a user (set isActive to true)
     */
    activateUser(id: string): Promise<User>;
    /**
     * Deactivate a user (set isActive to false)
     */
    deactivateUser(id: string): Promise<User>;
    /**
     * Ban a user (set isBanned to true)
     */
    banUser(id: string): Promise<User>;
    /**
     * Unban a user (set isBanned to false)
     */
    unbanUser(id: string): Promise<User>;
    /**
     * Soft delete a user (set deletedAt to current date)
     */
    softDeleteUser(id: string): Promise<User>;
    /**
     * Restore a soft deleted user (set deletedAt to null)
     */
    restoreUser(id: string): Promise<User>;
    /**
     * Find user by ID including soft deleted users (for admin operations)
     */
    findByIdIncludingDeleted(id: string): Promise<User | null>;
}
export declare const userRepository: PrismaUserRepository;
//# sourceMappingURL=prisma-user.repository.d.ts.map