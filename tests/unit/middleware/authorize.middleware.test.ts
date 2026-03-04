// ============================================================================
// AUTHORIZE MIDDLEWARE TESTS
// ============================================================================
// Tests pour le middleware d'autorisation
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '@prisma/client';

describe('Authorize Middleware', () => {
  // -------------------------------------------------------------------------
  // Tests: Vérification d'authentification
  // -------------------------------------------------------------------------

  describe('Authentication Check', () => {
    it('devrait rejeter si utilisateur non authentifié', async () => {
      // Arrange
      const mockRequest = {
        user: undefined,
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authorize } = await import('../../../src/shared/middleware/authorize.middleware.ts');
      const middleware = authorize(Role.CLIENT);

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 401);
    });

    it('devrait accepter si utilisateur authentifié', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: 'user-id-123',
          email: 'test@example.com',
          role: Role.CLIENT,
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authorize } = await import('../../../src/shared/middleware/authorize.middleware.ts');
      const middleware = authorize(Role.CLIENT);

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  // -------------------------------------------------------------------------
  // Tests: Vérification de rôle
  // -------------------------------------------------------------------------

  describe('Role Validation', () => {
    it('devrait autoriser CLIENT pour route CLIENT', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: 'user-id-123',
          email: 'client@example.com',
          role: Role.CLIENT,
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authorize } = await import('../../../src/shared/middleware/authorize.middleware.ts');
      const middleware = authorize(Role.CLIENT);

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('devrait refuser WORKER pour route CLIENT', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: 'worker-id-456',
          email: 'worker@example.com',
          role: Role.WORKER,
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authorize } = await import('../../../src/shared/middleware/authorize.middleware.ts');
      const middleware = authorize(Role.CLIENT);

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 403);
    });

    it('devrait refuser ADMIN pour route CLIENT + WORKER (pas dans la liste)', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: 'admin-id-789',
          email: 'admin@example.com',
          role: Role.ADMIN,
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authorize } = await import('../../../src/shared/middleware/authorize.middleware.ts');
      const middleware = authorize(Role.CLIENT, Role.WORKER);

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert - Le middleware refuse car ADMIN n'est pas dans la liste des rôles autorisés
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 403);
    });

    it('devrait accepter plusieurs rôles autorisés', async () => {
      // Arrange
      const mockRequest = {
        user: {
          sub: 'worker-id-456',
          email: 'worker@example.com',
          role: Role.WORKER,
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authorize } = await import('../../../src/shared/middleware/authorize.middleware.ts');
      const middleware = authorize(Role.CLIENT, Role.WORKER);

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  // -------------------------------------------------------------------------
  // Tests: Sécurité - Rôle nunca du client
  // -------------------------------------------------------------------------

  describe('Security: Role from Token', () => {
    it('ne devrait jamais utiliser le rôle fourni par le client', async () => {
      // Arrange - Simulation d'une tentative de spoofing de rôle
      const mockRequest = {
        user: {
          sub: 'user-id-123',
          email: 'user@example.com',
          role: Role.CLIENT, // Le vrai rôle du token
        },
        body: {
          role: Role.ADMIN, // Tentative de spoofing via le body
        },
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as any;

      const mockNext = vi.fn();

      const { authorize } = await import('../../../src/shared/middleware/authorize.middleware.ts');
      const middleware = authorize(Role.ADMIN); // Cherche à accéder à une route ADMIN

      // Act
      await middleware(mockRequest, mockResponse, mockNext);

      // Assert - Le middleware refuse car le vrai rôle est CLIENT
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toHaveProperty('statusCode', 403);
      // Le body.role ne doit jamais être utilisé
      expect(mockRequest.user?.role).not.toBe(mockRequest.body?.role);
    });
  });
});
