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
     * @param workerId - Optional worker ID to filter services
     * @param skip - Number of records to skip (calculated from page in controller)
     * @param take - Number of records to take (pageSize)
     */
    async execute(workerId, skip = 0, take = 10) {
        const { services, total } = await this.serviceRepository.findAll(workerId, skip, take);
        return {
            services: services.map((service) => service.toResponse()),
            total,
        };
    }
}
//# sourceMappingURL=get-services.usecase.js.map