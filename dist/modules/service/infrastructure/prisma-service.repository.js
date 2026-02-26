// Infrastructure Layer - Prisma Service Repository
// Implements IServiceRepository using Prisma
import { PrismaClient, Prisma } from '@prisma/client';
import { Service as ServiceEntity } from '../domain/index.js';
/**
 * Prisma Service Repository
 *
 * Implements IServiceRepository interface using Prisma
 */
export class PrismaServiceRepository {
    prisma;
    constructor(prismaClient) {
        this.prisma = prismaClient ?? new PrismaClient();
    }
    /**
     * Find service by ID
     */
    async findById(id) {
        const prismaService = await this.prisma.service.findUnique({
            where: { id },
        });
        if (!prismaService) {
            return null;
        }
        return ServiceEntity.fromPrisma(prismaService);
    }
    /**
     * Find all services with pagination
     */
    async findAll(workerId, skip, take) {
        const where = workerId ? { workerId } : {};
        const [prismaServices, total] = await Promise.all([
            this.prisma.service.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    worker: {
                        include: {
                            profession: true,
                        },
                    },
                },
            }),
            this.prisma.service.count({ where }),
        ]);
        return {
            services: prismaServices.map(ServiceEntity.fromPrisma),
            total,
        };
    }
    /**
     * Create a new service
     */
    async create(input) {
        const prismaService = await this.prisma.service.create({
            data: {
                title: input.title,
                description: input.description,
                minPrice: input.minPrice,
                maxPrice: input.maxPrice,
                worker: {
                    connect: { id: input.workerId },
                },
            },
        });
        return ServiceEntity.fromPrisma(prismaService);
    }
    /**
     * Update an existing service
     */
    async update(id, input) {
        const updateData = {};
        if (input.title !== undefined) {
            updateData.title = input.title;
        }
        if (input.description !== undefined) {
            updateData.description = input.description;
        }
        if (input.minPrice !== undefined) {
            updateData.minPrice = input.minPrice;
        }
        if (input.maxPrice !== undefined) {
            updateData.maxPrice = input.maxPrice;
        }
        const prismaService = await this.prisma.service.update({
            where: { id },
            data: updateData,
        });
        return ServiceEntity.fromPrisma(prismaService);
    }
    /**
     * Delete a service
     */
    async delete(id) {
        await this.prisma.service.delete({
            where: { id },
        });
    }
    /**
     * Find service by ID and verify ownership
     */
    async findByIdAndWorkerId(id, workerId) {
        const prismaService = await this.prisma.service.findFirst({
            where: {
                id,
                workerId,
            },
        });
        if (!prismaService) {
            return null;
        }
        return ServiceEntity.fromPrisma(prismaService);
    }
}
// Export singleton instance
export const serviceRepository = new PrismaServiceRepository();
//# sourceMappingURL=prisma-service.repository.js.map