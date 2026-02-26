import type { Profession, CreateProfessionInput, UpdateProfessionInput } from '../domain/index.js';
/**
 * Profession Repository Interface
 *
 * Following ISP - specialized interface for Profession operations
 */
export interface IProfessionRepository {
    /**
     * Find profession by ID
     */
    findById(id: string): Promise<Profession | null>;
    /**
     * Find profession by name
     */
    findByName(name: string): Promise<Profession | null>;
    /**
     * Find all professions ordered by name
     */
    findAll(): Promise<Profession[]>;
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
//# sourceMappingURL=profession.repository.interface.d.ts.map