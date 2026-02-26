import type { Service, CreateServiceInput, UpdateServiceInput } from '../domain/index.js';
/**
 * Service Repository Interface
 *
 * Following ISP - specialized interface for Service operations
 */
export interface IServiceRepository {
    /**
     * Find service by ID
     */
    findById(id: string): Promise<Service | null>;
    /**
     * Find all services with pagination
     */
    findAll(workerId: string | undefined, skip: number, take: number): Promise<{
        services: Service[];
        total: number;
    }>;
    /**
     * Create a new service
     */
    create(input: CreateServiceInput): Promise<Service>;
    /**
     * Update an existing service
     */
    update(id: string, input: UpdateServiceInput): Promise<Service>;
    /**
     * Delete a service
     */
    delete(id: string): Promise<void>;
    /**
     * Find service by ID and verify ownership
     */
    findByIdAndWorkerId(id: string, workerId: string): Promise<Service | null>;
}
//# sourceMappingURL=service.repository.interface.d.ts.map