// Use Cases Layer - List Professions Use Case
/**
 * List Professions Use Case
 */
export class ListProfessionsUseCase {
    professionRepository;
    constructor(professionRepository) {
        this.professionRepository = professionRepository;
    }
    /**
     * Execute the use case
     * Returns all professions ordered by name ascending
     */
    async execute() {
        const professions = await this.professionRepository.findAll();
        return professions.map((profession) => profession.toResponse());
    }
}
//# sourceMappingURL=list-professions.usecase.js.map