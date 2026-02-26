// Use Cases Layer - Create Profession Use Case

import type { IProfessionRepository } from './profession.repository.interface.js';
import type { ProfessionResponse, CreateProfessionInput } from '../domain/index.js';

/**
 * Create Profession Use Case
 */
export class CreateProfessionUseCase {
  constructor(private readonly professionRepository: IProfessionRepository) {}

  /**
   * Execute the use case
   * @throws Error if profession with same name already exists
   */
  async execute(input: CreateProfessionInput): Promise<ProfessionResponse> {
    // Business rule: Check if profession with same name already exists
    const existingProfession = await this.professionRepository.findByName(input.name);
    
    if (existingProfession) {
      const error = new Error('Une profession avec ce nom existe déjà.') as Error & { statusCode: number; code: string };
      error.statusCode = 409;
      error.code = 'PROFESSION_ALREADY_EXISTS';
      throw error;
    }

    // Create the profession
    const profession = await this.professionRepository.create({
      name: input.name,
      description: input.description,
    });

    return profession.toResponse();
  }
}
