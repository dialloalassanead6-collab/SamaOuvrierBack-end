import type { Request, Response, NextFunction } from 'express';
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
export declare class UserController {
    private addUserUseCase;
    private getUsersUseCase;
    private getUserByIdUseCase;
    private updateUserUseCase;
    private deleteUserUseCase;
    constructor();
    /**
     * Create a new user (admin only)
     * POST /users
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all users (admin only)
     * GET /users
     *
     * Pagination is handled by pagination middleware
     * req.pagination contains { page, pageSize, skip, take }
     */
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user by ID (admin only)
     * GET /users/:id
     */
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user (admin only)
     * PUT /users/:id
     */
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete user (admin only)
     * DELETE /users/:id
     */
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map