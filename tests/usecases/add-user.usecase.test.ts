// Unit Test - AddUserUseCase
// Demonstrates how to test use cases with dependency injection

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '@prisma/client';
import { AddUserUseCase } from '../../src/modules/user/application/add-user.usecase.js';
import type { IUserRepository } from '../../src/modules/user/application/user.repository.interface.js';
import type { User, CreateUserInput } from '../../src/modules/user/domain/user.entity.js';

// Mock User entity
const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  role: Role.CLIENT,
  createdAt: new Date(),
  updatedAt: new Date(),
  // Private property, not accessible
} as User;

// Mock repository interface
const createMockUserRepository = (): IUserRepository => ({
  findByEmail: vi.fn().mockResolvedValue(null),
  findById: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue({ users: [], total: 0 }),
  create: vi.fn().mockResolvedValue(mockUser),
  update: vi.fn().mockResolvedValue(mockUser),
  delete: vi.fn().mockResolvedValue(undefined),
  existsByEmail: vi.fn().mockResolvedValue(false),
});

describe('AddUserUseCase', () => {
  let useCase: AddUserUseCase;
  let mockRepository: IUserRepository;

  beforeEach(() => {
    mockRepository = createMockUserRepository();
    useCase = new AddUserUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a user with CLIENT role by default', async () => {
      // Arrange
      const input: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockRepository.existsByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...input,
        role: Role.CLIENT,
      });
      expect(result.email).toBe('test@example.com');
    });

    it('should create a user with specified role', async () => {
      // Arrange
      const input: CreateUserInput = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
      };

      // Act
      const result = await useCase.execute(input, Role.ADMIN);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...input,
        role: Role.ADMIN,
      });
      expect(result.email).toBe('admin@example.com');
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const input: CreateUserInput = {
        email: 'existing@example.com',
        password: 'password123',
      };
      
      // Setup mock to return true for email exists
      vi.spyOn(mockRepository, 'existsByEmail').mockResolvedValueOnce(true);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Email already exists');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});

/**
 * KEY POINTS FROM THIS TEST:
 * 
 * 1. DEPENDENCY INJECTION: The use case accepts any implementation of IUserRepository
 *    This allows us to easily swap between:
 *    - PrismaUserRepository (production)
 *    - Mock repository (testing)
 *    - In-memory repository (testing)
 *    - Any future implementation
 * 
 * 2. TESTING IN ISOLATION: We don't need a real database to test the use case
 *    This makes tests fast and reliable
 * 
 * 3. MOCKING: We can easily mock any behavior we need
 * 
 * 4. SOLID PRINCIPLES DEMONSTRATED:
 *    - SRP: Use case only handles user creation logic
 *    - DIP: Depends on IUserRepository interface, not implementation
 *    - OCP: Can be extended without modification
 */
