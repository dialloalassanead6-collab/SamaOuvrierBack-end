/**
 * Money Value Object
 *
 * RESPONSABILITÉS:
 * - Représenter une somme d'argent avec sa devise
 * - Garantir l'immutabilité
 * - Gérer les opérations mathématiques sur l'argent
 * - Valider les montants
 */
export declare class Money {
    readonly amount: number;
    readonly currency: string;
    private constructor();
    /**
     * Crée un objet Money à partir d'un montant et d'une devise
     * @throws Error si le montant est négatif
     */
    static create(amount: number, currency?: string): Money;
    /**
     * Crée un objet Money à partir d'un montant en centimes
     */
    static fromCents(cents: number, currency?: string): Money;
    /**
     * Crée un objet Money avec zéro valeur
     */
    static zero(currency?: string): Money;
    /**
     * Additionne deux montants
     * @throws Error si les devises sont différentes
     */
    add(other: Money): Money;
    /**
     * Soustrait un montant
     * @throws Error si le résultat est négatif
     */
    subtract(other: Money): Money;
    /**
     * Multiplie le montant par un facteur
     */
    multiply(factor: number): Money;
    /**
     * Calcule un pourcentage du montant
     */
    percentage(percent: number): Money;
    /**
     * Convertit en centimes
     */
    toCents(): number;
    /**
     * Vérifie si le montant est zéro
     */
    isZero(): boolean;
    /**
     * Vérifie si le montant est positif
     */
    isPositive(): boolean;
    /**
     * Vérifie si le montant est négatif
     */
    isNegative(): boolean;
    /**
     * Compare deux montants
     * @returns -1 si this < other, 0 si equal, 1 si this > other
     */
    compare(other: Money): number;
    /**
     * Vérifie l'égalité avec un autre Money
     */
    equals(other: Money): boolean;
    private ensureSameCurrency;
    /**
     * Convertit en objet simple pour JSON
     */
    toJSON(): {
        amount: number;
        currency: string;
    };
    /**
     * Représentation en chaîne
     */
    toString(): string;
}
export type MoneyProps = {
    amount: number;
    currency: string;
};
//# sourceMappingURL=Money.d.ts.map