// Use Cases Layer - Delete Service Use Case
/**
 * Delete Service Use Case
 */
export class DeleteServiceUseCase {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    /**
     * Execute the use case
     */
    async execute(id, workerId) {
        // Verify service exists
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new Error('Service not found');
        }
        // Business rule: Verify ownership
        if (!service.belongsToWorker(workerId)) {
            throw new Error('Unauthorized: You do not own this service');
        }
        await this.serviceRepository.delete(id);
    }
}
//# sourceMappingURL=delete-service.usecase.js.map