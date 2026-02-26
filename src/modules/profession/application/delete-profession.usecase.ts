// Use Cases Layer - Delete Profession Use Case

import type { IProfessionRepository } from './profession.repository.interface.js';

/**
 * Delete Profession Use Case
 */
export class DeleteProfessionUseCase {
  constructor(private readonly professionRepository: IProfessionRepository) {}

  /**
   * Execute the use case
   * @throws Error if profession not found
   */
  async execute(id: string): Promise<void> {
    // Business rule: Check if profession exists
    const existingProfession = await this.professionRepository.findById(id);
    
    if (!existingProfession) {
      const error = new Error('Profession introuvable.') as Error & { statusCode: number; code: string };
      error.statusCode = 404;
      error.code = 'PROFESSION_NOT_FOUND';
      throw error;
    }

    // Delete the profession
    await this.professionRepository.delete(id);
  }
}
