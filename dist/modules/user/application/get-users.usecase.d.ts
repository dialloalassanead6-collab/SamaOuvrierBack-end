import type { IUserRepository } from './user.repository.interface.js';
import type { UserResponse } from '../domain/index.js';
/**
 * Get Users Use Case
 */
export declare class GetUsersUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Execute the use case
     * @param skip - Number of records to skip (calculated from page in controller)
     * @param take - Number of records to take (pageSize)
     */
    execute(skip?: number, take?: number): Promise<{
        users: UserResponse[];
        total: number;
    }>;
}
//# sourceMappingURL=get-users.usecase.d.ts.map