// Use Cases Layer - Add Service Use Case

import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse, CreateServiceInput } from '../domain/index.js';

/**
 * Add Service Use Case
 * 
 * SECURITY RULES:
 * - Only WORKER role can create services
 * - The workerId is taken from the authenticated user's JWT (not from request body)
 */
export class AddServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

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
    // Create the service with the worker's ID (from JWT)
    const serviceData: CreateServiceInput = {
      ...input,
      workerId,
    };
    
    const service = await this.serviceRepository.create(serviceData);
    return service.toResponse();
  }
}
