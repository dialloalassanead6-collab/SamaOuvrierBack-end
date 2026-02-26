import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse, UpdateServiceInput } from '../domain/index.js';
/**
 * Update Service Use Case
 *
 * SECURITY RULES:
 * - WORKER: Can only update their own services
 * - ADMIN: Can update any service
 */
export declare class UpdateServiceUseCase {
    private readonly serviceRepository;
    constructor(serviceRepository: IServiceRepository);
    /**
     * Execute the use case
     *
     * @param id - Service ID to update
     * @param userId - ID of the user making the request (from JWT)
     * @param userRole - Role of the user making the request (from JWT)
     * @param input - Service update data
     */
    execute(id: string, userId: string, userRole: 'ADMIN' | 'WORKER' | 'CLIENT', input: UpdateServiceInput): Promise<ServiceResponse>;
}
//# sourceMappingURL=update-service.usecase.d.ts.map