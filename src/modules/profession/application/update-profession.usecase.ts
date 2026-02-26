// Use Cases Layer - Update Profession Use Case

import type { IProfessionRepository } from './profession.repository.interface.js';
import type { ProfessionResponse, UpdateProfessionInput } from '../domain/index.js';

/**
 * Update Profession Use Case
 */
export class UpdateProfessionUseCase {
  constructor(private readonly professionRepository: IProfessionRepository) {}

  /**
   * Execute the use case
   * @throws Error if profession not found
   * @throws Error if new name already exists
   */
  async execute(id: string, input: UpdateProfessionInput): Promise<ProfessionResponse> {
    // Business rule: Check if profession exists
    const existingProfession = await this.professionRepository.findById(id);
    
    if (!existingProfession) {
      const error = new Error('Profession introuvable.') as Error & { statusCode: number; code: string };
      error.statusCode = 404;
      error.code = 'PROFESSION_NOT_FOUND';
      throw error;
    }

    // Business rule: Check if new name already exists (if name is being changed)
    if (input.name && input.name !== existingProfession.name) {
      const nameExists = await this.professionRepository.findByName(input.name);
      
      if (nameExists) {
        const error = new Error('Une profession avec ce nom existe déjà.') as Error & { statusCode: number; code: string };
        error.statusCode = 409;
        error.code = 'PROFESSION_ALREADY_EXISTS';
        throw error;
      }
    }

    // Update the profession
    const profession = await this.professionRepository.update(id, input);

    return profession.toResponse();
  }
}
