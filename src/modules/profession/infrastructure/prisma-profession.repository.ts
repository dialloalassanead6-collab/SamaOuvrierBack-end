// Infrastructure Layer - Prisma Profession Repository
// Implements IProfessionRepository using Prisma

import { PrismaClient, Prisma } from '@prisma/client';
import type { IProfessionRepository } from '../application/index.js';
import type { CreateProfessionInput, UpdateProfessionInput, Profession } from '../domain/index.js';
import { Profession as ProfessionEntity } from '../domain/index.js';

/**
 * Prisma Profession Repository
 * 
 * Implements IProfessionRepository interface using Prisma
 */
export class PrismaProfessionRepository implements IProfessionRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  /**
   * Find profession by ID
   */
  async findById(id: string): Promise<Profession | null> {
    const prismaProfession = await this.prisma.profession.findUnique({
      where: { id },
    });

    if (!prismaProfession) {
      return null;
    }

    return ProfessionEntity.fromPrisma(prismaProfession);
  }

  /**
   * Find profession by name
   */
  async findByName(name: string): Promise<Profession | null> {
    const prismaProfession = await this.prisma.profession.findUnique({
      where: { name },
    });

    if (!prismaProfession) {
      return null;
    }

    return ProfessionEntity.fromPrisma(prismaProfession);
  }

  /**
   * Find all professions with pagination
   */
  async findAll(skip: number = 0, take: number = 100): Promise<{ professions: Profession[]; total: number }> {
    const [prismaProfessions, total] = await Promise.all([
      this.prisma.profession.findMany({
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.profession.count(),
    ]);

    return {
      professions: prismaProfessions.map(ProfessionEntity.fromPrisma),
      total,
    };
  }

  /**
   * Create a new profession
   */
  async create(input: CreateProfessionInput): Promise<Profession> {
    const prismaProfession = await this.prisma.profession.create({
      data: {
        name: input.name,
        description: input.description ?? null,
      },
    });

    return ProfessionEntity.fromPrisma(prismaProfession);
  }

  /**
   * Update an existing profession
   */
  async update(id: string, input: UpdateProfessionInput): Promise<Profession> {
    const updateData: Prisma.ProfessionUpdateInput = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    const prismaProfession = await this.prisma.profession.update({
      where: { id },
      data: updateData,
    });

    return ProfessionEntity.fromPrisma(prismaProfession);
  }

  /**
   * Delete a profession
   */
  async delete(id: string): Promise<void> {
    await this.prisma.profession.delete({
      where: { id },
    });
  }
}

// Export singleton instance
export const professionRepository = new PrismaProfessionRepository();
