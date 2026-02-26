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
     * Execute the use case with pagination
     * @param skip - Number of records to skip
     * @param take - Number of records to take
     */
    async execute(skip = 0, take = 100) {
        const { professions, total } = await this.professionRepository.findAll(skip, take);
        return {
            professions: professions.map((profession) => profession.toResponse()),
            total,
        };
    }
}
//# sourceMappingURL=list-professions.usecase.js.map