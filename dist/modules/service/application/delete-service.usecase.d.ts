import type { IServiceRepository } from './service.repository.interface.js';
/**
 * Delete Service Use Case
 *
 * SECURITY RULES:
 * - WORKER: Can only delete their own services
 * - ADMIN: Can delete any service
 */
export declare class DeleteServiceUseCase {
    private readonly serviceRepository;
    constructor(serviceRepository: IServiceRepository);
    /**
     * Execute the use case
     *
     * @param id - Service ID to delete
     * @param userId - ID of the user making the request (from JWT)
     * @param userRole - Role of the user making the request (from JWT)
     */
    execute(id: string, userId: string, userRole: 'ADMIN' | 'WORKER' | 'CLIENT'): Promise<void>;
}
//# sourceMappingURL=delete-service.usecase.d.ts.map