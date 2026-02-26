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
     * @param skip - Number of records to skip (calculated from page in controller)
     * @param take - Number of records to take (pageSize)
     */
    async execute(skip = 0, take = 10) {
        const { users, total } = await this.userRepository.findAll(skip, take);
        return {
            users: users.map((user) => user.toResponse()),
            total,
        };
    }
}
//# sourceMappingURL=get-users.usecase.js.map