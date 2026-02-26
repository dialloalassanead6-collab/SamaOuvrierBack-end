// Use Cases Layer - Update Service Use Case
/**
 * Update Service Use Case
 */
export class UpdateServiceUseCase {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    /**
     * Execute the use case
     */
    async execute(id, workerId, input) {
        // Verify service exists
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new Error('Service not found');
        }
        // Business rule: Verify ownership
        if (!service.belongsToWorker(workerId)) {
            throw new Error('Unauthorized: You do not own this service');
        }
        const updatedService = await this.serviceRepository.update(id, input);
        return updatedService.toResponse();
    }
}
//# sourceMappingURL=update-service.usecase.js.map