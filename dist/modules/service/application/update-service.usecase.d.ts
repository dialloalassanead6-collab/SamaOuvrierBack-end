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
     * Validate service price range for update
     * Uses existing values if new values are not provided
     *
     * @param currentMinPrice - Current minimum price from existing service
     * @param currentMaxPrice - Current maximum price from existing service
     * @param inputMinPrice - New minimum price from input (optional)
     * @param inputMaxPrice - New maximum price from input (optional)
     * @throws BusinessErrors.badRequest if validation fails
     */
    private validatePriceRangeUpdate;
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