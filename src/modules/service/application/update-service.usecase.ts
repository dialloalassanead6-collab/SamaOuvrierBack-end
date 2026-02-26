// Use Cases Layer - Update Service Use Case

import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse, UpdateServiceInput } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';

/**
 * Update Service Use Case
 * 
 * SECURITY RULES:
 * - WORKER: Can only update their own services
 * - ADMIN: Can update any service
 */
export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   * 
   * @param id - Service ID to update
   * @param userId - ID of the user making the request (from JWT)
   * @param userRole - Role of the user making the request (from JWT)
   * @param input - Service update data
   */
  async execute(
    id: string,
    userId: string,
    userRole: 'ADMIN' | 'WORKER' | 'CLIENT',
    input: UpdateServiceInput
  ): Promise<ServiceResponse> {
    // Verify service exists
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw BusinessErrors.notFound('Service introuvable');
    }

    // BUSINESS RULE: Verify ownership for WORKER role
    // ADMIN can update any service, WORKER can only update their own
    if (userRole === 'WORKER' && !service.belongsToWorker(userId)) {
      throw BusinessErrors.forbidden('Vous ne pouvez modifier que vos propres services');
    }

    // If CLIENT tries to update, deny access (shouldn't reach here due to route protection)
    if (userRole === 'CLIENT') {
      throw BusinessErrors.forbidden('Les clients ne peuvent pas modifier les services');
    }

    const updatedService = await this.serviceRepository.update(id, input);
    return updatedService.toResponse();
  }
}
