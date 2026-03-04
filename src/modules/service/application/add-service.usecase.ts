// Use Cases Layer - Add Service Use Case

import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse, CreateServiceInput } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
import type { IUserRepository } from '../../user/application/index.js';
import { WorkerStatus } from '@prisma/client';

/**
 * Add Service Use Case
 * 
 * SECURITY RULES:
 * - Only WORKER role can create services
 * - The worker must be APPROVED (workerStatus === APPROVED)
 * - The workerId is taken from the authenticated user's JWT (not from request body)
 */
export class AddServiceUseCase {
  constructor(
    private readonly serviceRepository: IServiceRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Validate service price range
   * 
   * @throws BusinessErrors.badRequest if validation fails
   */
  private validatePriceRange(minPrice: number, maxPrice: number): void {
    // Prix minimum doit être >= 2000 (comme Mission)
    if (minPrice < 2000) {
      throw BusinessErrors.badRequest(
        'Le prix minimum doit être supérieur ou égal à 2000'
      );
    }
    // Prix maximum doit être >= prix minimum
    if (maxPrice < minPrice) {
      throw BusinessErrors.badRequest(
        `Le prix maximum (${maxPrice}) doit être supérieur ou égal au prix minimum (${minPrice})`
      );
    }
  }

  /**
   * Execute the use case
   * 
   * @param input - Service creation data (without workerId)
   * @param workerId - Worker ID from authenticated user (JWT)
   */
  async execute(
    input: Omit<CreateServiceInput, 'workerId'>,
    workerId: string
  ): Promise<ServiceResponse> {
    // Verify worker exists and is APPROVED
    const worker = await this.userRepository.findById(workerId);
    if (!worker) {
      throw BusinessErrors.notFound('Worker introuvable');
    }
    
    // Check if worker is approved
    if (worker.workerStatus !== WorkerStatus.APPROVED) {
      throw BusinessErrors.forbidden(
        'Vous devez être approuvé pour créer des services. Statut actuel: ' + 
        (worker.workerStatus || 'INACTIVE')
      );
    }

    // Validate price range BEFORE creating service
    this.validatePriceRange(input.minPrice, input.maxPrice);

    // Create the service with the worker's ID (from JWT)
    const serviceData: CreateServiceInput = {
      ...input,
      workerId,
    };
    
    const service = await this.serviceRepository.create(serviceData);
    return service.toResponse();
  }
}
