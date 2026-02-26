// Interface Layer - Service Controller
// Handles HTTP requests and responses
import { AddServiceUseCase, GetServicesUseCase, GetServiceByIdUseCase, UpdateServiceUseCase, DeleteServiceUseCase, } from '../application/index.js';
import { serviceRepository } from '../infrastructure/index.js';
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
        this.addServiceUseCase = new AddServiceUseCase(serviceRepository);
        this.getServicesUseCase = new GetServicesUseCase(serviceRepository);
        this.getServiceByIdUseCase = new GetServiceByIdUseCase(serviceRepository);
        this.updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
        this.deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);
    }
    /**
     * Create a new service
     * POST /services
     */
    async create(req, res, next) {
        try {
            const { title, description, minPrice, maxPrice, workerId } = req.body;
            const service = await this.addServiceUseCase.execute({
                title,
                description,
                minPrice,
                maxPrice,
                workerId,
            });
            res.status(201).json(service);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get all services
     * GET /services
     */
    async getAll(req, res, next) {
        try {
            const page = Number(req.query['page']) || 1;
            const pageSize = Number(req.query['pageSize']) || 10;
            const workerId = req.query['workerId'];
            const { services, total } = await this.getServicesUseCase.execute(workerId, page, pageSize);
            res.status(200).json({
                services,
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
     * Get service by ID
     * GET /services/:id
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
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, minPrice, maxPrice } = req.body;
            const workerId = req.body.workerId;
            if (!workerId) {
                res.status(400).json({ error: 'workerId is required' });
                return;
            }
            const service = await this.updateServiceUseCase.execute(id, workerId, {
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
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const workerId = req.body.workerId;
            if (!workerId) {
                res.status(400).json({ error: 'workerId is required' });
                return;
            }
            await this.deleteServiceUseCase.execute(id, workerId);
            res.status(200).json({ message: 'Service deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
// Export singleton instance
export const serviceController = new ServiceController();
//# sourceMappingURL=service.controller.js.map