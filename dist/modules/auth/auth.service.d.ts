import type { IAuthRepository } from './application/index.js';
import type { RegisterResponse, LoginResponse, ClientRegisterInput, WorkerRegisterInput } from './domain/index.js';
import type { IPasswordService } from '../../shared/security/password.service.js';
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
export declare class AuthService {
    private readonly registerUseCase;
    private readonly loginUseCase;
    constructor(authRepository: IAuthRepository, passwordService: IPasswordService);
    /**
     * Register a new user (client or worker)
     */
    register(input: ClientRegisterInput | WorkerRegisterInput): Promise<RegisterResponse>;
    /**
     * Authenticate user with email and password
     */
    login(email: string, password: string): Promise<LoginResponse>;
}
//# sourceMappingURL=auth.service.d.ts.map