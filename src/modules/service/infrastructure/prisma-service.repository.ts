// Infrastructure Layer - Prisma Service Repository
// Implements IServiceRepository using Prisma

import { PrismaClient, Prisma } from '@prisma/client';
import type { IServiceRepository } from '../application/index.js';
import type { CreateServiceInput, UpdateServiceInput, Service } from '../domain/index.js';
import { Service as ServiceEntity } from '../domain/index.js';

/**
 * Prisma Service Repository
 * 
 * Implements IServiceRepository interface using Prisma
 */
export class PrismaServiceRepository implements IServiceRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  /**
   * Find service by ID
   */
  async findById(id: string): Promise<Service | null> {
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
  async findAll(
    workerId: string | undefined,
    skip: number,
    take: number
  ): Promise<{ services: Service[]; total: number }> {
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
  async create(input: CreateServiceInput): Promise<Service> {
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
  async update(id: string, input: UpdateServiceInput): Promise<Service> {
    const updateData: Prisma.ServiceUpdateInput = {};

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
  async delete(id: string): Promise<void> {
    await this.prisma.service.delete({
      where: { id },
    });
  }

  /**
   * Find service by ID and verify ownership
   */
  async findByIdAndWorkerId(id: string, workerId: string): Promise<Service | null> {
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
