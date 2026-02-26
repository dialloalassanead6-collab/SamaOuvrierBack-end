// Interface Layer - User Controller
// Handles HTTP requests and responses

import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import type { CreateUserInput, UpdateUserInput } from '../domain/index.js';
import {
  AddUserUseCase,
  GetUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from '../application/index.js';
import { userRepository } from '../infrastructure/index.js';
import { passwordService } from '../../../shared/security/password.service.js';
import { getPaginationMetadata } from '../../../shared/middleware/pagination.middleware.js';

/**
 * User Controller
 * 
 * RESPONSABILITIES:
 * - Handle HTTP requests
 * - Validate input
 * - Call use cases
 * - Format HTTP responses
 * 
 * This follows the Adapter pattern:
 * - Converts between HTTP requests and use case inputs
 * - Is the entry point for the application
 * 
 * SOLID Principles:
 * - DIP: Use cases are injected, controller depends on abstractions
 * - SRP: Only handles HTTP concerns
 */
export class UserController {
  private addUserUseCase: AddUserUseCase;
  private getUsersUseCase: GetUsersUseCase;
  private getUserByIdUseCase: GetUserByIdUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;

  constructor() {
    // Dependency injection - use cases depend on interfaces, not implementations
    // AddUserUseCase requires passwordService for secure password hashing
    this.addUserUseCase = new AddUserUseCase(userRepository, passwordService);
    this.getUsersUseCase = new GetUsersUseCase(userRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
  }

  /**
   * Create a new user (admin only)
   * POST /users
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, nom, prenom, adresse, tel, role } = req.body as CreateUserInput & { role?: Role };
      
      const user = await this.addUserUseCase.execute(
        { email, password, nom, prenom, adresse, tel },
        role
      );

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   * GET /users
   * 
   * Pagination is handled by pagination middleware
   * req.pagination contains { page, pageSize, skip, take }
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Use pagination params from middleware (already validated and capped)
      const { page, pageSize, skip, take } = req.pagination!;

      const { users, total } = await this.getUsersUseCase.execute(skip, take);

      // Generate standardized pagination metadata
      const pagination = getPaginationMetadata(page, pageSize, total);

      res.status(200).json({
        data: users,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   * GET /users/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const user = await this.getUserByIdUseCase.execute(id);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user (admin only)
   * PUT /users/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const body = req.body as Partial<UpdateUserInput>;

      // Only include fields that are actually provided
      const updateData: UpdateUserInput = {};
      if (body.email !== undefined) updateData.email = body.email;
      if (body.nom !== undefined) updateData.nom = body.nom;
      if (body.prenom !== undefined) updateData.prenom = body.prenom;
      if (body.adresse !== undefined) updateData.adresse = body.adresse;
      if (body.tel !== undefined) updateData.tel = body.tel;
      if (body.role !== undefined) updateData.role = body.role;

      const user = await this.updateUserUseCase.execute(id, updateData);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (admin only)
   * DELETE /users/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      await this.deleteUserUseCase.execute(id);

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const userController = new UserController();
