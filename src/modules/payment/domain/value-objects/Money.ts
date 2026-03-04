// ============================================================================
// MONEY VALUE OBJECT - DOMAIN LAYER
// ============================================================================
// Représente une valeur monétaire avec devise
// Value Object immuable遵循 Domain-Driven Design
// ============================================================================

/**
 * Money Value Object
 * 
 * RESPONSABILITÉS:
 * - Représenter une somme d'argent avec sa devise
 * - Garantir l'immutabilité
 * - Gérer les opérations mathématiques sur l'argent
 * - Valider les montants
 */
export class Money {
  public readonly amount: number;
  public readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  // ============================================================================
  // FACTORY METHODS
  // ============================================================================

  /**
   * Crée un objet Money à partir d'un montant et d'une devise
   * @throws Error si le montant est négatif
   */
  static create(amount: number, currency: string = 'XOF'): Money {
    if (amount < 0) {
      throw new Error('Le montant ne peut pas être négatif');
    }
    
    // Arrondir à 2 décimales pour la précision
    const roundedAmount = Math.round(amount * 100) / 100;
    
    return new Money(roundedAmount, currency.toUpperCase());
  }

  /**
   * Crée un objet Money à partir d'un montant en centimes
   */
  static fromCents(cents: number, currency: string = 'XOF'): Money {
    return Money.create(cents / 100, currency);
  }

  /**
   * Crée un objet Money avec zéro valeur
   */
  static zero(currency: string = 'XOF'): Money {
    return new Money(0, currency.toUpperCase());
  }

  // ============================================================================
  // OPERATIONS
  // ============================================================================

  /**
   * Additionne deux montants
   * @throws Error si les devises sont différentes
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * Soustrait un montant
   * @throws Error si le résultat est négatif
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Le résultat de la soustraction ne peut pas être négatif');
    }
    return Money.create(result, this.currency);
  }

  /**
   * Multiplie le montant par un facteur
   */
  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * Calcule un pourcentage du montant
   */
  percentage(percent: number): Money {
    return Money.create((this.amount * percent) / 100, this.currency);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Convertit en centimes
   */
  toCents(): number {
    return Math.round(this.amount * 100);
  }

  /**
   * Vérifie si le montant est zéro
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Vérifie si le montant est positif
   */
  isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Vérifie si le montant est négatif
   */
  isNegative(): boolean {
    return this.amount < 0;
  }

  /**
   * Compare deux montants
   * @returns -1 si this < other, 0 si equal, 1 si this > other
   */
  compare(other: Money): number {
    this.ensureSameCurrency(other);
    if (this.amount < other.amount) return -1;
    if (this.amount > other.amount) return 1;
    return 0;
  }

  /**
   * Vérifie l'égalité avec un autre Money
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Impossible d'opérer sur des devises différentes: ${this.currency} et ${other.currency}`);
    }
  }

  // ============================================================================
  // SERIALIZATION
  // ============================================================================

  /**
   * Convertit en objet simple pour JSON
   */
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  /**
   * Représentation en chaîne
   */
  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}

// ============================================================================
// TYPE UTILITAIRE
// ============================================================================

export type MoneyProps = {
  amount: number;
  currency: string;
};
