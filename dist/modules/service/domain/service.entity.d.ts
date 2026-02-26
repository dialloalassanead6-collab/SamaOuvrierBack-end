import type { Service as PrismaService } from '@prisma/client';
/**
 * Service Entity - Core domain object
 *
 * RESPONSABILITIES:
 * - Represent a service offered by a worker
 * - Encapsulate service-related business rules
 * - Be independent of any framework
 *
 * INVARIANTS:
 * - Title must be at least 3 characters
 * - Description must be at least 10 characters
 * - minPrice must be >= 0
 * - maxPrice must be >= minPrice
 */
export declare class Service {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly minPrice: number;
    readonly maxPrice: number;
    readonly workerId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: ServiceProps);
    /**
     * Validate title invariant
     */
    private validateTitle;
    /**
     * Validate description invariant
     */
    private validateDescription;
    /**
     * Validate price range invariant
     */
    private validatePriceRange;
    /**
     * Check if this service belongs to a specific worker
     */
    belongsToWorker(workerId: string): boolean;
    /**
     * Convert to plain object for response
     */
    toResponse(): ServiceResponse;
    /**
     * Create Service from Prisma entity (Factory method)
     */
    static fromPrisma(service: PrismaService): Service;
}
/**
 * Service properties interface
 */
export interface ServiceProps {
    id: string;
    title: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    workerId: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Service response DTO
 */
export interface ServiceResponse {
    id: string;
    title: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    workerId: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Service create input DTO
 */
export interface CreateServiceInput {
    title: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    workerId: string;
}
/**
 * Service update input DTO
 */
export interface UpdateServiceInput {
    title?: string | undefined;
    description?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}
/**
 * Service with worker details
 */
export interface ServiceWithWorker extends ServiceResponse {
    worker: {
        id: string;
        name: string;
        email: string;
        profession: {
            id: string;
            name: string;
        } | null;
    } | null;
}
//# sourceMappingURL=service.entity.d.ts.map