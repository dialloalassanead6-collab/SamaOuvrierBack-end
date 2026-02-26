import { PrismaClient } from '@prisma/client';
import type { IProfessionRepository } from '../application/index.js';
import type { CreateProfessionInput, UpdateProfessionInput, Profession } from '../domain/index.js';
/**
 * Prisma Profession Repository
 *
 * Implements IProfessionRepository interface using Prisma
 */
export declare class PrismaProfessionRepository implements IProfessionRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    /**
     * Find profession by ID
     */
    findById(id: string): Promise<Profession | null>;
    /**
     * Find profession by name
     */
    findByName(name: string): Promise<Profession | null>;
    /**
     * Find all professions with pagination
     */
    findAll(skip?: number, take?: number): Promise<{
        professions: Profession[];
        total: number;
    }>;
    /**
     * Create a new profession
     */
    create(input: CreateProfessionInput): Promise<Profession>;
    /**
     * Update an existing profession
     */
    update(id: string, input: UpdateProfessionInput): Promise<Profession>;
    /**
     * Delete a profession
     */
    delete(id: string): Promise<void>;
}
export declare const professionRepository: PrismaProfessionRepository;
//# sourceMappingURL=prisma-profession.repository.d.ts.map