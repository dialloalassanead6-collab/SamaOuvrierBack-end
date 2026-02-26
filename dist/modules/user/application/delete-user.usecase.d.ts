import type { IUserRepository } from './user.repository.interface.js';
import type { User } from '../domain/index.js';
/**
 * Delete User Use Case
 *
 * Now performs soft delete by default (sets deletedAt to current date)
 */
export declare class DeleteUserUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Execute the use case - soft delete
     */
    execute(id: string): Promise<User>;
}
//# sourceMappingURL=delete-user.usecase.d.ts.map