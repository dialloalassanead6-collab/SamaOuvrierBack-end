import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse, CreateServiceInput } from '../domain/index.js';
import type { IUserRepository } from '../../user/application/index.js';
/**
 * Add Service Use Case
 *
 * SECURITY RULES:
 * - Only WORKER role can create services
 * - The worker must be APPROVED (workerStatus === APPROVED)
 * - The workerId is taken from the authenticated user's JWT (not from request body)
 */
export declare class AddServiceUseCase {
    private readonly serviceRepository;
    private readonly userRepository;
    constructor(serviceRepository: IServiceRepository, userRepository: IUserRepository);
    /**
     * Validate service price range
     *
     * @throws BusinessErrors.badRequest if validation fails
     */
    private validatePriceRange;
    /**
     * Execute the use case
     *
     * @param input - Service creation data (without workerId)
     * @param workerId - Worker ID from authenticated user (JWT)
     */
    execute(input: Omit<CreateServiceInput, 'workerId'>, workerId: string): Promise<ServiceResponse>;
}
//# sourceMappingURL=add-service.usecase.d.ts.map