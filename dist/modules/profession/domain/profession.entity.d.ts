import type { Profession as PrismaProfession } from '@prisma/client';
/**
 * Profession Entity - Core domain object
 *
 * RESPONSABILITIES:
 * - Represent a profession in the system
 * - Encapsulate profession-related business rules
 * - Be independent of any framework
 *
 * INVARIANTS:
 * - Name must be at least 2 characters
 * - Name must not exceed 100 characters
 */
export declare class Profession {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: ProfessionProps);
    /**
     * Validate name invariant
     */
    private validateName;
    /**
     * Check if this profession has a description
     */
    hasDescription(): boolean;
    /**
     * Convert to plain object for response
     */
    toResponse(): ProfessionResponse;
    /**
     * Create Profession from Prisma entity (Factory method)
     */
    static fromPrisma(profession: PrismaProfession): Profession;
}
/**
 * Profession properties interface
 */
export interface ProfessionProps {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Profession response DTO
 */
export interface ProfessionResponse {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Profession create input DTO
 */
export interface CreateProfessionInput {
    name: string;
    description?: string | undefined;
}
/**
 * Profession update input DTO
 */
export interface UpdateProfessionInput {
    name?: string | undefined;
    description?: string | undefined;
}
//# sourceMappingURL=profession.entity.d.ts.map