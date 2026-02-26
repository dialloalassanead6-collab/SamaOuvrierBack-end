// Service Layer - Auth Service
// Contains all authentication business logic
// Uses use cases for business logic

import type { IAuthRepository } from './application/index.js';
import { RegisterUseCase } from './application/index.js';
import { LoginUseCase } from './application/index.js';
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
export class AuthService {
  private readonly registerUseCase: RegisterUseCase;
  private readonly loginUseCase: LoginUseCase;

  constructor(authRepository: IAuthRepository, passwordService: IPasswordService) {
    this.registerUseCase = new RegisterUseCase(authRepository, passwordService);
    this.loginUseCase = new LoginUseCase(authRepository, passwordService);
  }

  /**
   * Register a new user (client or worker)
   */
  async register(input: ClientRegisterInput | WorkerRegisterInput): Promise<RegisterResponse> {
    return this.registerUseCase.execute(input);
  }

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.loginUseCase.execute(email, password);
  }
}
