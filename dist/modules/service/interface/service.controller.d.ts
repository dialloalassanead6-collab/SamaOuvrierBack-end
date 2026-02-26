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
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all services
     * GET /services
     */
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get service by ID
     * GET /services/:id
     */
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update service
     * PUT /services/:id
     */
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete service
     * DELETE /services/:id
     */
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const serviceController: ServiceController;
//# sourceMappingURL=service.controller.d.ts.map