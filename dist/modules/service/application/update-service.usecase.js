// Use Cases Layer - Update Service Use Case
import { BusinessErrors } from '../../../shared/errors/index.js';
/**
 * Update Service Use Case
 *
 * SECURITY RULES:
 * - WORKER: Can only update their own services
 * - ADMIN: Can update any service
 */
export class UpdateServiceUseCase {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    /**
     * Execute the use case
     *
     * @param id - Service ID to update
     * @param userId - ID of the user making the request (from JWT)
     * @param userRole - Role of the user making the request (from JWT)
     * @param input - Service update data
     */
    async execute(id, userId, userRole, input) {
        // Verify service exists
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw BusinessErrors.notFound('Service introuvable');
        }
        // BUSINESS RULE: Verify ownership for WORKER role
        // ADMIN can update any service, WORKER can only update their own
        if (userRole === 'WORKER' && !service.belongsToWorker(userId)) {
            throw BusinessErrors.forbidden('Vous ne pouvez modifier que vos propres services');
        }
        // If CLIENT tries to update, deny access (shouldn't reach here due to route protection)
        if (userRole === 'CLIENT') {
            throw BusinessErrors.forbidden('Les clients ne peuvent pas modifier les services');
        }
        const updatedService = await this.serviceRepository.update(id, input);
        return updatedService.toResponse();
    }
}
//# sourceMappingURL=update-service.usecase.js.map