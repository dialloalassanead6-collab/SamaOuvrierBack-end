// Use Cases Layer - Get Service By ID Use Case
/**
 * Get Service By ID Use Case
 */
export class GetServiceByIdUseCase {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    /**
     * Execute the use case
     */
    async execute(id) {
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new Error('Service not found');
        }
        return service.toResponse();
    }
}
//# sourceMappingURL=get-service-by-id.usecase.js.map