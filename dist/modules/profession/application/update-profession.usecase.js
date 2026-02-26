// Use Cases Layer - Update Profession Use Case
/**
 * Update Profession Use Case
 */
export class UpdateProfessionUseCase {
    professionRepository;
    constructor(professionRepository) {
        this.professionRepository = professionRepository;
    }
    /**
     * Execute the use case
     * @throws Error if profession not found
     * @throws Error if new name already exists
     */
    async execute(id, input) {
        // Business rule: Check if profession exists
        const existingProfession = await this.professionRepository.findById(id);
        if (!existingProfession) {
            const error = new Error('Profession introuvable.');
            error.statusCode = 404;
            error.code = 'PROFESSION_NOT_FOUND';
            throw error;
        }
        // Business rule: Check if new name already exists (if name is being changed)
        if (input.name && input.name !== existingProfession.name) {
            const nameExists = await this.professionRepository.findByName(input.name);
            if (nameExists) {
                const error = new Error('Une profession avec ce nom existe déjà.');
                error.statusCode = 409;
                error.code = 'PROFESSION_ALREADY_EXISTS';
                throw error;
            }
        }
        // Update the profession
        const profession = await this.professionRepository.update(id, input);
        return profession.toResponse();
    }
}
//# sourceMappingURL=update-profession.usecase.js.map