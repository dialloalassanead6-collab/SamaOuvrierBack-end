// Use Cases Layer - Get User By ID Use Case
/**
 * Get User By ID Use Case
 */
export class GetUserByIdUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Execute the use case
     */
    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user.toResponse();
    }
}
//# sourceMappingURL=get-user-by-id.usecase.js.map