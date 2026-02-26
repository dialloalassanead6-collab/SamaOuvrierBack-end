// Infrastructure Layer - Prisma Profession Repository
// Implements IProfessionRepository using Prisma
import { PrismaClient, Prisma } from '@prisma/client';
import { Profession as ProfessionEntity } from '../domain/index.js';
/**
 * Prisma Profession Repository
 *
 * Implements IProfessionRepository interface using Prisma
 */
export class PrismaProfessionRepository {
    prisma;
    constructor(prismaClient) {
        this.prisma = prismaClient ?? new PrismaClient();
    }
    /**
     * Find profession by ID
     */
    async findById(id) {
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
    async findByName(name) {
        const prismaProfession = await this.prisma.profession.findUnique({
            where: { name },
        });
        if (!prismaProfession) {
            return null;
        }
        return ProfessionEntity.fromPrisma(prismaProfession);
    }
    /**
     * Find all professions ordered by name
     */
    async findAll() {
        const prismaProfessions = await this.prisma.profession.findMany({
            orderBy: { name: 'asc' },
        });
        return prismaProfessions.map(ProfessionEntity.fromPrisma);
    }
    /**
     * Create a new profession
     */
    async create(input) {
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
    async update(id, input) {
        const updateData = {};
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
    async delete(id) {
        await this.prisma.profession.delete({
            where: { id },
        });
    }
}
// Export singleton instance
export const professionRepository = new PrismaProfessionRepository();
//# sourceMappingURL=prisma-profession.repository.js.map