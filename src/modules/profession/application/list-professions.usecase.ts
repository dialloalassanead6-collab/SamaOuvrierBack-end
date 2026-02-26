// Use Cases Layer - List Professions Use Case

import type { IProfessionRepository } from './profession.repository.interface.js';
import type { Profession, ProfessionResponse } from '../domain/index.js';

/**
 * List Professions Use Case
 */
export class ListProfessionsUseCase {
  constructor(private readonly professionRepository: IProfessionRepository) {}

  /**
   * Execute the use case with pagination
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   */
  async execute(skip: number = 0, take: number = 100): Promise<{ professions: ProfessionResponse[]; total: number }> {
    const { professions, total } = await this.professionRepository.findAll(skip, take);

    return {
      professions: professions.map((profession: Profession) => profession.toResponse()),
      total,
    };
  }
}
