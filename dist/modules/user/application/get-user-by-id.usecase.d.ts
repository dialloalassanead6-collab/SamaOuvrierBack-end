import type { IUserRepository } from './user.repository.interface.js';
import type { UserResponse } from '../domain/index.js';
/**
 * Get User By ID Use Case
 */
export declare class GetUserByIdUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Execute the use case
     */
    execute(id: string): Promise<UserResponse>;
}
//# sourceMappingURL=get-user-by-id.usecase.d.ts.map