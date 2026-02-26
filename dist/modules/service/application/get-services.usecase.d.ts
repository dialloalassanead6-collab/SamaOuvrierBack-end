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
     */
    execute(workerId: string | undefined, page?: number, pageSize?: number): Promise<{
        services: ServiceResponse[];
        total: number;
    }>;
}
//# sourceMappingURL=get-services.usecase.d.ts.map