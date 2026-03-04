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
   * Validate service price range for update
   * Uses existing values if new values are not provided
   * 
   * @param currentMinPrice - Current minimum price from existing service
   * @param currentMaxPrice - Current maximum price from existing service
   * @param inputMinPrice - New minimum price from input (optional)
   * @param inputMaxPrice - New maximum price from input (optional)
   * @throws BusinessErrors.badRequest if validation fails
   */
  private validatePriceRangeUpdate(
    currentMinPrice: number,
    currentMaxPrice: number,
    inputMinPrice?: number,
    inputMaxPrice?: number
  ): void {
    // Use new values if provided, otherwise keep current values
    const newMinPrice = inputMinPrice !== undefined ? inputMinPrice : currentMinPrice;
    const newMaxPrice = inputMaxPrice !== undefined ? inputMaxPrice : currentMaxPrice;

    // Prix minimum doit être >= 2000 (comme Mission)
    if (newMinPrice < 2000) {
      throw BusinessErrors.badRequest(
        'Le prix minimum doit être supérieur ou égal à 2000'
      );
    }
    // Prix maximum doit être >= prix minimum
    if (newMaxPrice < newMinPrice) {
      throw BusinessErrors.badRequest(
        `Le prix maximum (${newMaxPrice}) doit être supérieur ou égal au prix minimum (${newMinPrice})`
      );
    }
  }

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

    // Validate price range if minPrice or maxPrice is being updated
    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
      this.validatePriceRangeUpdate(
        service.minPrice,
        service.maxPrice,
        input.minPrice,
        input.maxPrice
      );
    }

    const updatedService = await this.serviceRepository.update(id, input);
    return updatedService.toResponse();
  }
}
