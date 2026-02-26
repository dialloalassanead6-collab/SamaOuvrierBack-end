// Domain Layer - Profession Entity
// Represents the core business object "Profession" with its rules and invariants
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
export class Profession {
    id;
    name;
    description;
    createdAt;
    updatedAt;
    constructor(props) {
        // Validate invariants in constructor
        this.validateName(props.name);
        this.id = props.id;
        this.name = props.name;
        this.description = props.description ?? null;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    /**
     * Validate name invariant
     */
    validateName(name) {
        if (name.length < 2) {
            throw new Error('Le nom doit contenir au moins 2 caractères');
        }
        if (name.length > 100) {
            throw new Error('Le nom ne doit pas dépasser 100 caractères');
        }
    }
    /**
     * Check if this profession has a description
     */
    hasDescription() {
        return this.description !== null && this.description.length > 0;
    }
    /**
     * Convert to plain object for response
     */
    toResponse() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    /**
     * Create Profession from Prisma entity (Factory method)
     */
    static fromPrisma(profession) {
        return new Profession({
            id: profession.id,
            name: profession.name,
            description: profession.description,
            createdAt: profession.createdAt,
            updatedAt: profession.updatedAt,
        });
    }
}
//# sourceMappingURL=profession.entity.js.map