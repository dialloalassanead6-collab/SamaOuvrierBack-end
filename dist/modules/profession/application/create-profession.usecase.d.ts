import type { IProfessionRepository } from './profession.repository.interface.js';
import type { ProfessionResponse, CreateProfessionInput } from '../domain/index.js';
/**
 * Create Profession Use Case
 */
export declare class CreateProfessionUseCase {
    private readonly professionRepository;
    constructor(professionRepository: IProfessionRepository);
    /**
     * Execute the use case
     * @throws Error if profession with same name already exists
     */
    execute(input: CreateProfessionInput): Promise<ProfessionResponse>;
}
//# sourceMappingURL=create-profession.usecase.d.ts.map