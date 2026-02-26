import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse, UpdateServiceInput } from '../domain/index.js';
/**
 * Update Service Use Case
 */
export declare class UpdateServiceUseCase {
    private readonly serviceRepository;
    constructor(serviceRepository: IServiceRepository);
    /**
     * Execute the use case
     */
    execute(id: string, workerId: string, input: UpdateServiceInput): Promise<ServiceResponse>;
}
//# sourceMappingURL=update-service.usecase.d.ts.map