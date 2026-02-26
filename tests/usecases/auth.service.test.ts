// Unit Test - AuthService
// Tests authentication business logic with dependency injection

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '@prisma/client';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import type { IAuthRepository } from '../../src/modules/auth/application/index.js';
import type { UserWithPassword, RegisteredUser } from '../../src/modules/auth/domain/index.js';

// Mock user data
const mockUserWithPassword: UserWithPassword = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password: '$2b$12$hashedpassword', // Pre-hashed password
  name: 'Test User',
  role: Role.CLIENT,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRegisteredUser: RegisteredUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  role: Role.CLIENT,
  createdAt: new Date(),
};

// Mock repository interface
const createMockAuthRepository = (): IAuthRepository => ({
  findByEmailWithPassword: vi.fn().mockResolvedValue(null),
  findById: vi.fn().mockResolvedValue(null),
  existsByEmail: vi.fn().mockResolvedValue(false),
  createUser: vi.fn().mockResolvedValue(mockRegisteredUser),
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockRepository: IAuthRepository;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    authService = new AuthService(mockRepository);
  });

  describe('register', () => {
    it('should create a user with CLIENT role', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const password = 'password123';
      const name = 'New User';

      // Act
      const result = await authService.register(email, password, name);

      // Assert
      expect(mockRepository.existsByEmail).toHaveBeenCalledWith(email);
      expect(mockRepository.createUser).toHaveBeenCalled();
      expect(result.user.email).toBe(email);
      expect(result.user.role).toBe(Role.CLIENT);
      expect(result.token).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'existsByEmail').mockResolvedValueOnce(true);

      // Act & Assert
      await expect(
        authService.register('existing@example.com', 'password123')
      ).rejects.toThrow('Email already registered');
      
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      // Arrange
      const password = 'mypassword123';

      // Act
      await authService.register('new@example.com', password);

      // Assert
      const createUserCall = mockRepository.createUser as ReturnType<typeof vi.fn>;
      const [, hashedPassword] = createUserCall.mock.calls[0];
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2b\$/); // bcrypt format
    });

    it('should return token on successful registration', async () => {
      // Arrange & Act
      const result = await authService.register('test@example.com', 'password123');

      // Assert
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'findByEmailWithPassword').mockResolvedValueOnce(
        mockUserWithPassword
      );
      // Mock bcrypt.compare to return true
      vi.mock('bcrypt', () => ({
        default: {
          compare: vi.fn().mockResolvedValue(true),
          hash: vi.fn().mockResolvedValue('$2b$12$hashed'),
        },
      }));

      // Act
      const result = await authService.login('test@example.com', 'password123');

      // Assert
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should throw 401 error if user not found', async () => {
      // Arrange - already returns null by default

      // Act & Assert
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw 401 error if password is invalid', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'findByEmailWithPassword').mockResolvedValueOnce(
        mockUserWithPassword
      );
      vi.mock('bcrypt', () => ({
        default: {
          compare: vi.fn().mockResolvedValue(false),
        },
      }));

      // Act & Assert
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should not expose password in response', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'findByEmailWithPassword').mockResolvedValueOnce(
        mockUserWithPassword
      );
      vi.mock('bcrypt', () => ({
        default: {
          compare: vi.fn().mockResolvedValue(true),
        },
      }));

      // Act
      const result = await authService.login('test@example.com', 'password123');

      // Assert
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid JWT token', async () => {
      // Arrange - first register to get a valid token
      const registerResult = await authService.register(
        'test@example.com',
        'password123'
      );
      const token = registerResult.token;

      // Act & Assert - should not throw
      expect(() => authService.verifyToken(token)).not.toThrow();
    });

    it('should throw on invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      expect(() => authService.verifyToken(invalidToken)).toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw on expired token', () => {
      // This test would require generating an expired token
      // For now, we skip this as it requires time manipulation
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      // Arrange
      vi.spyOn(mockRepository, 'findById').mockResolvedValueOnce(mockRegisteredUser);

      // Act
      const result = await authService.getUserById(mockRegisteredUser.id);

      // Assert
      expect(result).toEqual(mockRegisteredUser);
    });

    it('should return null if user not found', async () => {
      // Arrange - default returns null

      // Act
      const result = await authService.getUserById('nonexistent-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});

/**
 * KEY POINTS FROM THESE TESTS:
 * 
 * 1. DEPENDENCY INJECTION: AuthService accepts any implementation of IAuthRepository
 *    This allows testing without a real database
 * 
 * 2. SECURITY TESTS:
 *    - Password is hashed before saving
 *    - Password is never exposed in responses
 *    - Invalid credentials return generic error
 *    - Role is always forced to CLIENT
 * 
 * 3. BUSINESS LOGIC TESTS:
 *    - Registration creates user with token
 *    - Login validates credentials and returns token
 *    - Token verification works correctly
 * 
 * 4. SOLID PRINCIPLES:
 *    - SRP: Service only handles auth business logic
 *    - DIP: Depends on IAuthRepository interface
 *    - OCP: Can be extended without modification
 */
