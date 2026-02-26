import { PrismaClient } from '@prisma/client';
import type { IServiceRepository } from '../application/index.js';
import type { CreateServiceInput, UpdateServiceInput, Service } from '../domain/index.js';
/**
 * Prisma Service Repository
 *
 * Implements IServiceRepository interface using Prisma
 */
export declare class PrismaServiceRepository implements IServiceRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
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
export declare const serviceRepository: PrismaServiceRepository;
//# sourceMappingURL=prisma-service.repository.d.ts.map