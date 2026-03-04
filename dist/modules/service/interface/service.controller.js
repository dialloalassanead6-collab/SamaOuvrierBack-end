// Interface Layer - Service Controller
// Handles HTTP requests and responses
import { AddServiceUseCase, GetServicesUseCase, GetServiceByIdUseCase, UpdateServiceUseCase, DeleteServiceUseCase, } from '../application/index.js';
import { serviceRepository } from '../infrastructure/index.js';
import { userRepository } from '../../user/infrastructure/index.js';
import { getPaginationMetadata } from '../../../shared/middleware/pagination.middleware.js';
/**
 * Service Controller
 */
export class ServiceController {
    addServiceUseCase;
    getServicesUseCase;
    getServiceByIdUseCase;
    updateServiceUseCase;
    deleteServiceUseCase;
    constructor() {
        this.addServiceUseCase = new AddServiceUseCase(serviceRepository, userRepository);
        this.getServicesUseCase = new GetServicesUseCase(serviceRepository);
        this.getServiceByIdUseCase = new GetServiceByIdUseCase(serviceRepository);
        this.updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
        this.deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);
    }
    /**
     * Create a new service
     * POST /services
     *
     * SECURITY: Requires WORKER role (authenticated)
     * The workerId is taken from req.user.sub (JWT), not from request body
     */
    async create(req, res, next) {
        try {
            const { title, description, minPrice, maxPrice } = req.body;
            const workerId = req.user?.sub; // From JWT
            if (!workerId) {
                res.status(401).json({ error: 'Identifiant utilisateur manquant' });
                return;
            }
            const service = await this.addServiceUseCase.execute({
                title,
                description,
                minPrice,
                maxPrice,
            }, workerId);
            res.status(201).json(service);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get all services
     * GET /services
     *
     * SECURITY: Public access (no authentication required)
     * Pagination is mandatory and handled by pagination middleware
     */
    async getAll(req, res, next) {
        try {
            // Use pagination params from middleware (already validated and capped)
            const { page, pageSize, skip, take } = req.pagination;
            const workerId = req.query['workerId'];
            const { services, total } = await this.getServicesUseCase.execute(workerId, skip, take);
            // Generate standardized pagination metadata
            const pagination = getPaginationMetadata(page, pageSize, total);
            res.status(200).json({
                data: services,
                pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get service by ID
     * GET /services/:id
     *
     * SECURITY: Public access (no authentication required)
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const service = await this.getServiceByIdUseCase.execute(id);
            res.status(200).json(service);
        }
        catch (error) {
            next(error);
        }
    }
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
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, minPrice, maxPrice } = req.body;
            // Get user info from JWT (set by authenticate middleware)
            const userId = req.user?.sub;
            const userRole = req.user?.role;
            if (!userId || !userRole) {
                res.status(401).json({ error: 'Informations utilisateur manquantes' });
                return;
            }
            const service = await this.updateServiceUseCase.execute(id, userId, userRole, {
                title,
                description,
                minPrice,
                maxPrice,
            });
            res.status(200).json(service);
        }
        catch (error) {
            next(error);
        }
    }
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
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            // Get user info from JWT (set by authenticate middleware)
            const userId = req.user?.sub;
            const userRole = req.user?.role;
            if (!userId || !userRole) {
                res.status(401).json({ error: 'Informations utilisateur manquantes' });
                return;
            }
            await this.deleteServiceUseCase.execute(id, userId, userRole);
            res.status(200).json({ message: 'Service supprimé avec succès' });
        }
        catch (error) {
            next(error);
        }
    }
}
// Export singleton instance
export const serviceController = new ServiceController();
//# sourceMappingURL=service.controller.js.map