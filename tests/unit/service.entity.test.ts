// ============================================================================
// SERVICE ENTITY UNIT TESTS
// ============================================================================
// Tests pour l'entité Service et ses validations
// ============================================================================

import { describe, it, expect } from 'vitest';
import { Service } from '../../src/modules/service/domain/service.entity.js';

describe('Service Entity', () => {
  describe('Price Validation', () => {
    it('should create a service with valid prices', () => {
      const service = new Service({
        id: 'service-1',
        title: 'Plomberie',
        description: 'Services de plomberie complète',
        minPrice: 5000,
        maxPrice: 20000,
        workerId: 'worker-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.minPrice).toBe(5000);
      expect(service.maxPrice).toBe(20000);
      expect(service.title).toBe('Plomberie');
    });

    it('should throw error if minPrice < 2000', () => {
      expect(() => {
        new Service({
          id: 'service-1',
          title: 'Plomberie',
          description: 'Services de plomberie complète',
          minPrice: 1000,
          maxPrice: 20000,
          workerId: 'worker-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Le prix minimum doit être >= 2000');
    });

    it('should throw error if maxPrice < minPrice', () => {
      expect(() => {
        new Service({
          id: 'service-1',
          title: 'Plomberie',
          description: 'Services de plomberie complète',
          minPrice: 10000,
          maxPrice: 5000,
          workerId: 'worker-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Le prix maximum doit être >= prix minimum');
    });

    it('should allow minPrice exactly 2000', () => {
      const service = new Service({
        id: 'service-1',
        title: 'Menuiserie',
        description: 'Services de menuiserie complète',
        minPrice: 2000,
        maxPrice: 10000,
        workerId: 'worker-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.minPrice).toBe(2000);
    });

    it('should throw error if title < 3 characters', () => {
      expect(() => {
        new Service({
          id: 'service-1',
          title: 'AB',
          description: 'Services de plomberie complète',
          minPrice: 5000,
          maxPrice: 20000,
          workerId: 'worker-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Title must be at least 3 characters');
    });

    it('should throw error if description < 10 characters', () => {
      expect(() => {
        new Service({
          id: 'service-1',
          title: 'Plomberie',
          description: 'Plomberie',
          minPrice: 5000,
          maxPrice: 20000,
          workerId: 'worker-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Description must be at least 10 characters');
    });
  });

  describe('belongsToWorker()', () => {
    it('should return true if service belongs to worker', () => {
      const service = new Service({
        id: 'service-1',
        title: 'Plomberie',
        description: 'Services de plomberie complète',
        minPrice: 5000,
        maxPrice: 20000,
        workerId: 'worker-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.belongsToWorker('worker-123')).toBe(true);
    });

    it('should return false if service does not belong to worker', () => {
      const service = new Service({
        id: 'service-1',
        title: 'Plomberie',
        description: 'Services de plomberie complète',
        minPrice: 5000,
        maxPrice: 20000,
        workerId: 'worker-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(service.belongsToWorker('worker-456')).toBe(false);
    });
  });

  describe('toResponse()', () => {
    it('should convert to response object', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      
      const service = new Service({
        id: 'service-1',
        title: 'Plomberie',
        description: 'Services de plomberie complète',
        minPrice: 5000,
        maxPrice: 20000,
        workerId: 'worker-123',
        createdAt,
        updatedAt,
      });

      const response = service.toResponse();
      
      expect(response).toEqual({
        id: 'service-1',
        title: 'Plomberie',
        description: 'Services de plomberie complète',
        minPrice: 5000,
        maxPrice: 20000,
        workerId: 'worker-123',
        createdAt,
        updatedAt,
      });
    });
  });
});
