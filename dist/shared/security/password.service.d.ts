/**
 * Password Service Interface
 *
 * Defines the contract for password hashing operations.
 * Allows for easy mocking in tests and swapping implementations.
 */
export interface IPasswordService {
    /**
     * Hash a password
     * @param password - Plain text password to hash
     * @returns Hashed password
     */
    hash(password: string): Promise<string>;
    /**
     * Compare a plain text password with a hashed password
     * @param password - Plain text password
     * @param hashedPassword - Hashed password to compare against
     * @returns True if passwords match, false otherwise
     */
    compare(password: string, hashedPassword: string): Promise<boolean>;
}
/**
 * Password Service Implementation
 *
 * RESPONSABILITIES:
 * - Centralize all password hashing logic
 * - Provide configurable bcrypt rounds
 * - Be reusable across all modules (auth, user, admin)
 *
 * SOLID Principles:
 * - SRP: Single responsibility - only handles password operations
 * - DIP: Implements IPasswordService interface
 * - OCP: Can be extended without modifying existing code
 */
export declare class PasswordService implements IPasswordService {
    private readonly saltRounds;
    /**
     * Create a new PasswordService
     * @param saltRounds - Number of bcrypt salt rounds (default from config)
     */
    constructor(saltRounds?: number);
    /**
     * Hash a password using bcrypt
     *
     * @param password - Plain text password
     * @returns Hashed password
     */
    hash(password: string): Promise<string>;
    /**
     * Compare a plain text password with a hashed password
     * Uses bcrypt's compare for constant-time comparison
     *
     * @param password - Plain text password
     * @param hashedPassword - Hashed password to compare against
     * @returns True if passwords match, false otherwise
     */
    compare(password: string, hashedPassword: string): Promise<boolean>;
}
/**
 * Create a singleton instance of PasswordService
 * This follows the singleton pattern for simplicity in this project,
 * but the class can also be instantiated with custom salt rounds.
 */
export declare const passwordService: PasswordService;
//# sourceMappingURL=password.service.d.ts.map