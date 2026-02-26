// Use Cases Layer - User Repository Interface
// This interface defines the contract for user data access
// Following ISP - specialized interface for User operations

import type { Role, WorkerStatus } from '@prisma/client';
import type { User, CreateUserInput, UpdateUserInput } from '../domain/index.js';

/**
 * User Repository Interface
 * 
 * RESPONSABILITIES:
 * - Define contract for user data operations
 * - Is independent of the actual database technology
 * - Allows easy swapping between implementations (Prisma, MongoDB, in-memory, etc.)
 * 
 * This follows the Dependency Inversion Principle (DIP):
 * - High-level modules (use cases) depend on this abstraction
 * - Low-level modules (infrastructure) implement this abstraction
 */
export interface IUserRepository {
  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find all users with pagination
   */
  findAll(skip: number, take: number): Promise<{ users: User[]; total: number }>;

  /**
   * Create a new user
   */
  create(input: CreateUserInput & { role?: Role }): Promise<User>;

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

  // ========================================================================
  // Worker Validation Methods (Admin & Worker operations)
  // ========================================================================

  /**
   * Find workers by status (filter for admin)
   */
  findWorkersByStatus(status: WorkerStatus, skip: number, take: number): Promise<{ users: User[]; total: number }>;

  /**
   * Find all workers (no filter)
   */
  findAllWorkers(skip: number, take: number): Promise<{ users: User[]; total: number }>;

  /**
   * Update worker status (approve or reject)
   */
  updateWorkerStatus(id: string, status: WorkerStatus, rejectionReason?: string | null): Promise<User>;

  // ========================================================================
  // Admin Management Methods (activate, deactivate, ban, soft delete)
  // ========================================================================

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
