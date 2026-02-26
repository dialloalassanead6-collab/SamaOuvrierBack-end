// Use Cases Layer - Update User Use Case (continued)
/**
 * Update User Use Case
 */
export class UpdateUserUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Execute the use case
     */
    async execute(id, input) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        // Business rule: Check email uniqueness if email is being changed
        if (input.email && input.email !== user.email) {
            const emailExists = await this.userRepository.existsByEmail(input.email);
            if (emailExists) {
                throw new Error('Email already exists');
            }
        }
        const updatedUser = await this.userRepository.update(id, input);
        return updatedUser.toResponse();
    }
}
//# sourceMappingURL=update-user.usecase.js.map