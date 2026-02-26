import type { Request, Response, NextFunction } from 'express';
/**
 * Service Controller
 */
export declare class ServiceController {
    private addServiceUseCase;
    private getServicesUseCase;
    private getServiceByIdUseCase;
    private updateServiceUseCase;
    private deleteServiceUseCase;
    constructor();
    /**
     * Create a new service
     * POST /services
     *
     * SECURITY: Requires WORKER role (authenticated)
     * The workerId is taken from req.user.sub (JWT), not from request body
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all services
     * GET /services
     *
     * SECURITY: Public access (no authentication required)
     * Pagination is mandatory and handled by pagination middleware
     */
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get service by ID
     * GET /services/:id
     *
     * SECURITY: Public access (no authentication required)
     */
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update service
     * PUT /services/:id
     *
     * SECURITY:
     * - WORKER: Can only update their own services
     * - ADMIN: Can update any service
     * - CLIENT: Cannot update services (403)
     *
     * The userId and userRole are taken from JWT, not from request body
     */
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete service
     * DELETE /services/:id
     *
     * SECURITY:
     * - WORKER: Can only delete their own services
     * - ADMIN: Can delete any service
     * - CLIENT: Cannot delete services (403)
     *
     * The userId and userRole are taken from JWT, not from request body
     */
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const serviceController: ServiceController;
//# sourceMappingURL=service.controller.d.ts.map