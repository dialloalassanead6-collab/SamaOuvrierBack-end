import type { IProfessionRepository } from './profession.repository.interface.js';
import type { ProfessionResponse, UpdateProfessionInput } from '../domain/index.js';
/**
 * Update Profession Use Case
 */
export declare class UpdateProfessionUseCase {
    private readonly professionRepository;
    constructor(professionRepository: IProfessionRepository);
    /**
     * Execute the use case
     * @throws Error if profession not found
     * @throws Error if new name already exists
     */
    execute(id: string, input: UpdateProfessionInput): Promise<ProfessionResponse>;
}
//# sourceMappingURL=update-profession.usecase.d.ts.map