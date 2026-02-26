// Use Cases Layer - Add Service Use Case
/**
 * Add Service Use Case
 *
 * SECURITY RULES:
 * - Only WORKER role can create services
 * - The workerId is taken from the authenticated user's JWT (not from request body)
 */
export class AddServiceUseCase {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    /**
     * Execute the use case
     *
     * @param input - Service creation data (without workerId)
     * @param workerId - Worker ID from authenticated user (JWT)
     */
    async execute(input, workerId) {
        // Create the service with the worker's ID (from JWT)
        const serviceData = {
            ...input,
            workerId,
        };
        const service = await this.serviceRepository.create(serviceData);
        return service.toResponse();
    }
}
//# sourceMappingURL=add-service.usecase.js.map