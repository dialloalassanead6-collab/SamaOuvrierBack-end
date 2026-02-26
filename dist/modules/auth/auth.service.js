// Service Layer - Auth Service
// Contains all authentication business logic
// Uses use cases for business logic
import { RegisterUseCase } from './application/index.js';
import { LoginUseCase } from './application/index.js';
/**
 * Auth Service
 *
 * RESPONSABILITIES:
 * - Coordinate between use cases and controllers
 * - Handle password hashing via injected service
 * - Generate and verify JWT tokens
 * - NEVER expose password in responses
 *
 * Following Single Responsibility Principle:
 * - All auth-related business logic in one place
 * - No framework-specific code here
 *
 * SOLID Principles:
 * - DIP: Depends on IPasswordService (abstraction), not implementation
 */
export class AuthService {
    registerUseCase;
    loginUseCase;
    constructor(authRepository, passwordService) {
        this.registerUseCase = new RegisterUseCase(authRepository, passwordService);
        this.loginUseCase = new LoginUseCase(authRepository, passwordService);
    }
    /**
     * Register a new user (client or worker)
     */
    async register(input) {
        return this.registerUseCase.execute(input);
    }
    /**
     * Authenticate user with email and password
     */
    async login(email, password) {
        return this.loginUseCase.execute(email, password);
    }
}
//# sourceMappingURL=auth.service.js.map