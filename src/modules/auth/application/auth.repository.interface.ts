// Application Layer - Auth Repository Interface
// Contract for authentication data operations
// Follows Dependency Inversion Principle (DIP)

import type { Role, WorkerStatus } from '@prisma/client';
import type { RegisteredUser, UserWithPassword, ProfessionEntity } from '../domain/index.js';

/**
 * Data required to create a new user
 */
export interface CreateUserData {
  nom: string;
  prenom: string;
  adresse: string;
  tel: string;
  email: string;
  password: string;
  role: Role;
  workerStatus?: WorkerStatus;
  professionId?: string;
}

/**
 * Auth Repository Interface
 * 
 * RESPONSABILITIES:
 * - Define contract for auth-related data operations
 * - Independent of the actual database technology
 * - Allows easy swapping between implementations
 * 
 * Following Dependency Inversion Principle:
 * - High-level modules depend on this abstraction
 * - Low-level modules implement this abstraction
 */
export interface IAuthRepository {
  /**
   * Find user by email including password hash
   * Used for authentication purposes
   */
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;

  /**
   * Find user by ID
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
