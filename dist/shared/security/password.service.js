// ============================================================================
// PASSWORD SERVICE - Security Layer
// ============================================================================
// Centralized password hashing and verification service.
// Uses bcryptjs for secure password handling.
// ============================================================================
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';
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
export class PasswordService {
    saltRounds;
    /**
     * Create a new PasswordService
     * @param saltRounds - Number of bcrypt salt rounds (default from config)
     */
    constructor(saltRounds = config.BCRYPT_ROUNDS) {
        this.saltRounds = saltRounds;
    }
    /**
     * Hash a password using bcrypt
     *
     * @param password - Plain text password
     * @returns Hashed password
     */
    async hash(password) {
        return bcrypt.hash(password, this.saltRounds);
    }
    /**
     * Compare a plain text password with a hashed password
     * Uses bcrypt's compare for constant-time comparison
     *
     * @param password - Plain text password
     * @param hashedPassword - Hashed password to compare against
     * @returns True if passwords match, false otherwise
     */
    async compare(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
}
/**
 * Create a singleton instance of PasswordService
 * This follows the singleton pattern for simplicity in this project,
 * but the class can also be instantiated with custom salt rounds.
 */
export const passwordService = new PasswordService();
//# sourceMappingURL=password.service.js.map