/**
 * Rating Value Object
 * Encapsulates rating validation and logic
 */
export class Rating {
  private readonly _value: number;

  private static readonly MIN_RATING = 1;
  private static readonly MAX_RATING = 5;

  private constructor(value: number) {
    this._value = value;
  }

  /**
   * Create a Rating from a number value
   * @throws Error if rating is invalid
   */
  static create(value: number): Rating {
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
  static fromDatabase(value: number): Rating {
    return new Rating(value);
  }

  get value(): number {
    return this._value;
  }

  equals(other: Rating): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }

  toJSON(): number {
    return this._value;
  }
}
