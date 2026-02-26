import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse, CreateServiceInput } from '../domain/index.js';
/**
 * Add Service Use Case
 */
export declare class AddServiceUseCase {
    private readonly serviceRepository;
    constructor(serviceRepository: IServiceRepository);
    /**
     * Execute the use case
     */
    execute(input: CreateServiceInput): Promise<ServiceResponse>;
}
//# sourceMappingURL=add-service.usecase.d.ts.map