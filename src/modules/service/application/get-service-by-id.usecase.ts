// Use Cases Layer - Get Service By ID Use Case

import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse } from '../domain/index.js';

/**
 * Get Service By ID Use Case
 */
export class GetServiceByIdUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   */
  async execute(id: string): Promise<ServiceResponse> {
    const service = await this.serviceRepository.findById(id);
    
    if (!service) {
      throw new Error('Service not found');
    }

    return service.toResponse();
  }
}
