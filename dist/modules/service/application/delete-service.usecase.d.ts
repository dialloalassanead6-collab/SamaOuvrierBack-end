import type { IServiceRepository } from './service.repository.interface.js';
/**
 * Delete Service Use Case
 */
export declare class DeleteServiceUseCase {
    private readonly serviceRepository;
    constructor(serviceRepository: IServiceRepository);
    /**
     * Execute the use case
     */
    execute(id: string, workerId: string): Promise<void>;
}
//# sourceMappingURL=delete-service.usecase.d.ts.map