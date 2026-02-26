// Use Cases Layer - Get Services Use Case

import type { IServiceRepository } from './service.repository.interface.js';
import type { ServiceResponse } from '../domain/index.js';

/**
 * Get Services Use Case
 */
export class GetServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   * @param workerId - Optional worker ID to filter services
   * @param skip - Number of records to skip (calculated from page in controller)
   * @param take - Number of records to take (pageSize)
   */
  async execute(
    workerId: string | undefined,
    skip: number = 0,
    take: number = 10
  ): Promise<{ services: ServiceResponse[]; total: number }> {
    const { services, total } = await this.serviceRepository.findAll(workerId, skip, take);

    return {
      services: services.map((service) => service.toResponse()),
      total,
    };
  }
}
