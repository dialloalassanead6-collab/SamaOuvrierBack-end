import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse } from '../domain/index.js';
/**
 * Get Service By ID Use Case
 */
export declare class GetServiceByIdUseCase {
    private readonly serviceRepository;
    constructor(serviceRepository: IServiceRepository);
    /**
     * Execute the use case
     */
    execute(id: string): Promise<ServiceResponse>;
}
//# sourceMappingURL=get-service-by-id.usecase.d.ts.map