import type { IProfessionRepository } from './profession.repository.interface.js';
import type { ProfessionResponse } from '../domain/index.js';
/**
 * List Professions Use Case
 */
export declare class ListProfessionsUseCase {
    private readonly professionRepository;
    constructor(professionRepository: IProfessionRepository);
    /**
     * Execute the use case with pagination
     * @param skip - Number of records to skip
     * @param take - Number of records to take
     */
    execute(skip?: number, take?: number): Promise<{
        professions: ProfessionResponse[];
        total: number;
    }>;
}
//# sourceMappingURL=list-professions.usecase.d.ts.map