// Use Cases Layer - Create Profession Use Case
/**
 * Create Profession Use Case
 */
export class CreateProfessionUseCase {
    professionRepository;
    constructor(professionRepository) {
        this.professionRepository = professionRepository;
    }
    /**
     * Execute the use case
     * @throws Error if profession with same name already exists
     */
    async execute(input) {
        // Business rule: Check if profession with same name already exists
        const existingProfession = await this.professionRepository.findByName(input.name);
        if (existingProfession) {
            const error = new Error('Une profession avec ce nom existe déjà.');
            error.statusCode = 409;
            error.code = 'PROFESSION_ALREADY_EXISTS';
            throw error;
        }
        // Create the profession
        const profession = await this.professionRepository.create({
            name: input.name,
            description: input.description,
        });
        return profession.toResponse();
    }
}
//# sourceMappingURL=create-profession.usecase.js.map