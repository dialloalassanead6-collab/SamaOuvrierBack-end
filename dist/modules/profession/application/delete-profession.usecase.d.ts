import type { IProfessionRepository } from './profession.repository.interface.js';
/**
 * Delete Profession Use Case
 */
export declare class DeleteProfessionUseCase {
    private readonly professionRepository;
    constructor(professionRepository: IProfessionRepository);
    /**
     * Execute the use case
     * @throws Error if profession not found
     */
    execute(id: string): Promise<void>;
}
//# sourceMappingURL=delete-profession.usecase.d.ts.map