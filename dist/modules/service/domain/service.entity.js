// Domain Layer - Service Entity
// Represents the core business object "Service" with its rules and invariants
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
export class Service {
    id;
    title;
    description;
    minPrice;
    maxPrice;
    workerId;
    createdAt;
    updatedAt;
    constructor(props) {
        // Validate invariants in constructor
        this.validateTitle(props.title);
        this.validateDescription(props.description);
        this.validatePriceRange(props.minPrice, props.maxPrice);
        this.id = props.id;
        this.title = props.title;
        this.description = props.description;
        this.minPrice = props.minPrice;
        this.maxPrice = props.maxPrice;
        this.workerId = props.workerId;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    /**
     * Validate title invariant
     */
    validateTitle(title) {
        if (title.length < 3) {
            throw new Error('Title must be at least 3 characters');
        }
    }
    /**
     * Validate description invariant
     */
    validateDescription(description) {
        if (description.length < 10) {
            throw new Error('Description must be at least 10 characters');
        }
    }
    /**
     * Validate price range invariant
     */
    validatePriceRange(minPrice, maxPrice) {
        if (minPrice < 2000) {
            throw new Error('Le prix minimum doit être >= 2000');
        }
        if (maxPrice < minPrice) {
            throw new Error('Le prix maximum doit être >= prix minimum');
        }
    }
    /**
     * Check if this service belongs to a specific worker
     */
    belongsToWorker(workerId) {
        return this.workerId === workerId;
    }
    /**
     * Convert to plain object for response
     */
    toResponse() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            workerId: this.workerId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    /**
     * Create Service from Prisma entity (Factory method)
     */
    static fromPrisma(service) {
        return new Service({
            id: service.id,
            title: service.title,
            description: service.description,
            minPrice: Number(service.minPrice),
            maxPrice: Number(service.maxPrice),
            workerId: service.workerId,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
        });
    }
}
//# sourceMappingURL=service.entity.js.map