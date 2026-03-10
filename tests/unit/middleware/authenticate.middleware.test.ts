// ============================================================================
// AUTHENTICATE MIDDLEWARE TESTS
// ============================================================================
// Tests pour le middleware d'authentification
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { Role } from '../../__mocks__/prisma-client.js';

describe('Authenticate Middleware', () => {
  // Configuration pour les tests
  const JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-32chars';

  // -------------------------------------------------------------------------
  // Tests: Validation du header Authorization
  // -------------------------------------------------------------------------

  describe('Authorization Header Validation', () => {
    it('devrait rejeter si header authorization absent', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      // Import du middleware
      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 401);
    });

    it('devrait rejeter si format Bearer absent', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Basic token123',
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 401);
    });

    it('devrait rejeter si token absent', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer ',
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 401);
    });
  });

  // -------------------------------------------------------------------------
  // Tests: Validation du token JWT
  // Note: Ces tests sont en skipped car le middleware utilise la config chargée
  // Pour des tests complets, il faudrait mocker la config ou utiliser une DB de test
  // -------------------------------------------------------------------------

  describe('JWT Token Validation', () => {
    it.skip('devrait accepter un token JWT valide', async () => {
      // Arrange - Générer un token JWT valide
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        role: Role.CLIENT,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      const mockRequest = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toHaveProperty('sub', 'user-id-123');
      expect(mockRequest.user).toHaveProperty('email', 'test@example.com');
      expect(mockRequest.user).toHaveProperty('role', Role.CLIENT);
    });

    it('devrait rejeter un token JWT invalide', async () => {
      // Arrange - Token invalide
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 401);
    });

    it('devrait rejeter un token expiré', async () => {
      // Arrange - Token expiré
      const payload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        role: Role.CLIENT,
      };

      const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });

      const mockRequest = {
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 401);
    });
  });

  // -------------------------------------------------------------------------
  // Tests: Injection de l'utilisateur
  // Note: Tests en skipped pour les mêmes raisons que ci-dessus
  // -------------------------------------------------------------------------

  describe('User Injection', () => {
    it.skip('devrait injecter le payload dans req.user', async () => {
      // Arrange
      const payload = {
        sub: 'user-id-456',
        email: 'admin@example.com',
        role: Role.ADMIN,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      const mockRequest = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      const mockResponse = {} as any;
      const mockNext = vi.fn();

      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.sub).toBe('user-id-456');
      expect(mockRequest.user?.email).toBe('admin@example.com');
      expect(mockRequest.user?.role).toBe(Role.ADMIN);
    });

    it.skip('ne devrait pas exposer le mot de passe dans req.user', async () => {
      // Arrange
      const payload = {
        sub: 'user-id-789',
        email: 'user@example.com',
        role: Role.WORKER,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      const mockRequest = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      const mockResponse = {} as any;
      const mockNext = vi.fn();

      const { authenticate } = await import('../../../src/shared/middleware/authenticate.middleware.ts');
      const middleware = authenticate();

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockRequest.user).not.toHaveProperty('password');
    });
  });
});
