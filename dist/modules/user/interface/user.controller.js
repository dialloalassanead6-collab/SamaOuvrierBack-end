// Interface Layer - User Controller
// Handles HTTP requests and responses
import { AddUserUseCase, GetUsersUseCase, GetUserByIdUseCase, UpdateUserUseCase, DeleteUserUseCase, } from '../application/index.js';
import { userRepository } from '../infrastructure/index.js';
import { passwordService } from '../../../shared/security/password.service.js';
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
    addUserUseCase;
    getUsersUseCase;
    getUserByIdUseCase;
    updateUserUseCase;
    deleteUserUseCase;
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
    async create(req, res, next) {
        try {
            const { email, password, nom, prenom, adresse, tel, role } = req.body;
            const user = await this.addUserUseCase.execute({ email, password, nom, prenom, adresse, tel }, role);
            res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get all users (admin only)
     * GET /users
     */
    async getAll(req, res, next) {
        try {
            const page = Number(req.query['page']) || 1;
            const pageSize = Number(req.query['pageSize']) || 10;
            const { users, total } = await this.getUsersUseCase.execute(page, pageSize);
            res.status(200).json({
                users,
                pagination: {
                    page,
                    limit: pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get user by ID (admin only)
     * GET /users/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.getUserByIdUseCase.execute(id);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update user (admin only)
     * PUT /users/:id
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const body = req.body;
            // Only include fields that are actually provided
            const updateData = {};
            if (body.email !== undefined)
                updateData.email = body.email;
            if (body.nom !== undefined)
                updateData.nom = body.nom;
            if (body.prenom !== undefined)
                updateData.prenom = body.prenom;
            if (body.adresse !== undefined)
                updateData.adresse = body.adresse;
            if (body.tel !== undefined)
                updateData.tel = body.tel;
            if (body.role !== undefined)
                updateData.role = body.role;
            const user = await this.updateUserUseCase.execute(id, updateData);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete user (admin only)
     * DELETE /users/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.deleteUserUseCase.execute(id);
            res.status(200).json({ message: 'User deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
// Export singleton instance
export const userController = new UserController();
//# sourceMappingURL=user.controller.js.map