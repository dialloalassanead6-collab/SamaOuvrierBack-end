import type { IProfessionRepository } from './profession.repository.interface.js';
import type { ProfessionResponse } from '../domain/index.js';
/**
 * List Professions Use Case
 */
export declare class ListProfessionsUseCase {
    private readonly professionRepository;
    constructor(professionRepository: IProfessionRepository);
    /**
     * Execute the use case
     * Returns all professions ordered by name ascending
     */
    execute(): Promise<ProfessionResponse[]>;
}
//# sourceMappingURL=list-professions.usecase.d.ts.map