// Use Cases Layer - Delete Profession Use Case
/**
 * Delete Profession Use Case
 */
export class DeleteProfessionUseCase {
    professionRepository;
    constructor(professionRepository) {
        this.professionRepository = professionRepository;
    }
    /**
     * Execute the use case
     * @throws Error if profession not found
     */
    async execute(id) {
        // Business rule: Check if profession exists
        const existingProfession = await this.professionRepository.findById(id);
        if (!existingProfession) {
            const error = new Error('Profession introuvable.');
            error.statusCode = 404;
            error.code = 'PROFESSION_NOT_FOUND';
            throw error;
        }
        // Delete the profession
        await this.professionRepository.delete(id);
    }
}
//# sourceMappingURL=delete-profession.usecase.js.map