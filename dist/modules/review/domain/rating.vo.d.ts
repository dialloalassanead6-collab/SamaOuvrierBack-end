/**
 * Rating Value Object
 * Encapsulates rating validation and logic
 */
export declare class Rating {
    private readonly _value;
    private static readonly MIN_RATING;
    private static readonly MAX_RATING;
    private constructor();
    /**
     * Create a Rating from a number value
     * @throws Error if rating is invalid
     */
    static create(value: number): Rating;
    /**
     * Create a Rating from database value (trusted source)
     */
    static fromDatabase(value: number): Rating;
    get value(): number;
    equals(other: Rating): boolean;
    toString(): string;
    toJSON(): number;
}
//# sourceMappingURL=rating.vo.d.ts.map