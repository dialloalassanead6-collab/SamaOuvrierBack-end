// Use Cases Layer - Delete Service Use Case

import type { IServiceRepository } from './service.repository.interface.js';
import { BusinessErrors } from '../../../shared/errors/index.js';

/**
 * Delete Service Use Case
 * 
 * SECURITY RULES:
 * - WORKER: Can only delete their own services
 * - ADMIN: Can delete any service
 */
export class DeleteServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   * 
   * @param id - Service ID to delete
   * @param userId - ID of the user making the request (from JWT)
   * @param userRole - Role of the user making the request (from JWT)
   */
  async execute(
    id: string,
    userId: string,
    userRole: 'ADMIN' | 'WORKER' | 'CLIENT'
  ): Promise<void> {
    // Verify service exists
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw BusinessErrors.notFound('Service introuvable');
    }

    // BUSINESS RULE: Verify ownership for WORKER role
    // ADMIN can delete any service, WORKER can only delete their own
    if (userRole === 'WORKER' && !service.belongsToWorker(userId)) {
      throw BusinessErrors.forbidden('Vous ne pouvez supprimer que vos propres services');
    }

    // If CLIENT tries to delete, deny access (shouldn't reach here due to route protection)
    if (userRole === 'CLIENT') {
      throw BusinessErrors.forbidden('Les clients ne peuvent pas supprimer les services');
    }

    await this.serviceRepository.delete(id);
  }
}
