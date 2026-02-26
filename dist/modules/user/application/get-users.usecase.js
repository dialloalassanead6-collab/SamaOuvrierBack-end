// Use Cases Layer - Get Users Use Case
/**
 * Get Users Use Case
 */
export class GetUsersUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Execute the use case
     */
    async execute(page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const { users, total } = await this.userRepository.findAll(skip, pageSize);
        return {
            users: users.map((user) => user.toResponse()),
            total,
        };
    }
}
//# sourceMappingURL=get-users.usecase.js.map