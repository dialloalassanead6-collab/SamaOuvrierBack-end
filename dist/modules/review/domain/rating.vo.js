/**
 * Rating Value Object
 * Encapsulates rating validation and logic
 */
export class Rating {
    _value;
    static MIN_RATING = 1;
    static MAX_RATING = 5;
    constructor(value) {
        this._value = value;
    }
    /**
     * Create a Rating from a number value
     * @throws Error if rating is invalid
     */
    static create(value) {
        if (!Number.isInteger(value)) {
            throw new Error('Rating must be an integer');
        }
        if (value < Rating.MIN_RATING || value > Rating.MAX_RATING) {
            throw new Error(`Rating must be between ${Rating.MIN_RATING} and ${Rating.MAX_RATING}`);
        }
        return new Rating(value);
    }
    /**
     * Create a Rating from database value (trusted source)
     */
    static fromDatabase(value) {
        return new Rating(value);
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value.toString();
    }
    toJSON() {
        return this._value;
    }
}
//# sourceMappingURL=rating.vo.js.map