// Use Cases Layer - Get Services Use Case
/**
 * Get Services Use Case
 */
export class GetServicesUseCase {
    serviceRepository;
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }
    /**
     * Execute the use case
     */
    async execute(workerId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const { services, total } = await this.serviceRepository.findAll(workerId, skip, pageSize);
        return {
            services: services.map((service) => service.toResponse()),
            total,
        };
    }
}
//# sourceMappingURL=get-services.usecase.js.map