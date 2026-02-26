import type { IUserRepository } from './user.repository.interface.js';
import type { UserResponse, UpdateUserInput } from '../domain/index.js';
/**
 * Update User Use Case
 */
export declare class UpdateUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Execute the use case
     */
    execute(id: string, input: UpdateUserInput): Promise<UserResponse>;
}
//# sourceMappingURL=update-user.usecase.d.ts.map