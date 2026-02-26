// Use Cases Layer - Add Service Use Case
/**
 * Add Service Use Case
 */
export class AddServiceUseCase {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    /**
     * Execute the use case
     */
    async execute(input) {
        // Business rule: Validate that the service data is correct
        // The entity constructor will validate invariants
        const service = await this.serviceRepository.create(input);
        return service.toResponse();
    }
}
//# sourceMappingURL=add-service.usecase.js.map