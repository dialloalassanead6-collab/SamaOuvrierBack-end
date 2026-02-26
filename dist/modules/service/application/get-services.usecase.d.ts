import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse } from '../domain/index.js';
/**
 * Get Services Use Case
 */
export declare class GetServicesUseCase {
    private readonly serviceRepository;
    constructor(serviceRepository: IServiceRepository);
    /**
     * Execute the use case
     * @param workerId - Optional worker ID to filter services
     * @param skip - Number of records to skip (calculated from page in controller)
     * @param take - Number of records to take (pageSize)
     */
    execute(workerId: string | undefined, skip?: number, take?: number): Promise<{
        services: ServiceResponse[];
        total: number;
    }>;
}
//# sourceMappingURL=get-services.usecase.d.ts.map