// Infrastructure Layer - Prisma User Repository
// Implements IUserRepository using Prisma
import { PrismaClient, Prisma, Role, WorkerStatus } from '@prisma/client';
import { User as UserEntity } from '../domain/index.js';
/**
 * Prisma User Repository
 *
 * RESPONSABILITIES:
 * - Implement IUserRepository interface
 * - Handle all database operations for User
 * - Convert between Prisma models and Domain entities
 *
 * This follows the Dependency Inversion Principle:
 * - The interface (IUserRepository) is defined in the application layer
 * - This implementation is in the infrastructure layer
 * - Use cases depend on the abstraction, not the implementation
 */
export class PrismaUserRepository {
    prisma;
    constructor(prismaClient) {
        // Allow injection of mock client for testing
        this.prisma = prismaClient ?? new PrismaClient();
    }
    /**
     * Find user by email (ignores soft deleted users)
     */
    async findByEmail(email) {
        const prismaUser = await this.prisma.user.findFirst({
            where: {
                email,
                deletedAt: null,
                isBanned: false,
            },
        });
        if (!prismaUser) {
            return null;
        }
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Find user by ID (ignores soft deleted users)
     */
    async findById(id) {
        const prismaUser = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!prismaUser) {
            return null;
        }
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Find all users with pagination (ignores soft deleted users)
     */
    async findAll(skip, take) {
        const [prismaUsers, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { deletedAt: null, isBanned: false },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({
                where: { deletedAt: null },
            }),
        ]);
        return {
            users: prismaUsers.map(UserEntity.fromPrisma),
            total,
        };
    }
    /**
     * Create a new user
     * New users are active by default (isActive: true)
     */
    async create(input) {
        const prismaUser = await this.prisma.user.create({
            data: {
                nom: input.nom,
                prenom: input.prenom,
                adresse: input.adresse,
                tel: input.tel,
                email: input.email,
                password: input.password,
                role: input.role ?? Role.CLIENT,
                professionId: input.professionId ?? null,
                isActive: true,
                isBanned: false,
                deletedAt: null,
            },
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Update an existing user
     */
    async update(id, input) {
        const updateData = {};
        if (input.nom !== undefined) {
            updateData.nom = input.nom;
        }
        if (input.prenom !== undefined) {
            updateData.prenom = input.prenom;
        }
        if (input.adresse !== undefined) {
            updateData.adresse = input.adresse;
        }
        if (input.tel !== undefined) {
            updateData.tel = input.tel;
        }
        if (input.email !== undefined) {
            updateData.email = input.email;
        }
        if (input.role !== undefined) {
            updateData.role = input.role;
        }
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Delete a user
     */
    async delete(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
    /**
     * Check if email already exists
     */
    async existsByEmail(email) {
        const count = await this.prisma.user.count({
            where: { email },
        });
        return count > 0;
    }
    // ========================================================================
    // Worker Validation Methods (Admin & Worker operations)
    // ========================================================================
    /**
     * Find workers by status (filter for admin)
     * Only returns users with role = WORKER
     */
    async findWorkersByStatus(status, skip, take) {
        const [prismaUsers, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    role: Role.WORKER,
                    workerStatus: status,
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({
                where: {
                    role: Role.WORKER,
                    workerStatus: status,
                },
            }),
        ]);
        return {
            users: prismaUsers.map(UserEntity.fromPrisma),
            total,
        };
    }
    /**
     * Find all workers (no filter)
     * Only returns users with role = WORKER
     */
    async findAllWorkers(skip, take) {
        const [prismaUsers, total] = await Promise.all([
            this.prisma.user.findMany({
                where: {
                    role: Role.WORKER,
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({
                where: {
                    role: Role.WORKER,
                },
            }),
        ]);
        return {
            users: prismaUsers.map(UserEntity.fromPrisma),
            total,
        };
    }
    /**
     * Update worker status (approve or reject)
     */
    async updateWorkerStatus(id, status, rejectionReason) {
        const updateData = {
            workerStatus: status,
            // Set rejectionReason to null when approving, or to provided value when rejecting
            rejectionReason: status === WorkerStatus.REJECTED ? rejectionReason ?? null : null,
        };
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    // ========================================================================
    // Admin Management Methods (activate, deactivate, ban, soft delete)
    // ========================================================================
    /**
     * Activate a user (set isActive to true)
     */
    async activateUser(id) {
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: { isActive: true },
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Deactivate a user (set isActive to false)
     */
    async deactivateUser(id) {
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Ban a user (set isBanned to true)
     */
    async banUser(id) {
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: { isBanned: true },
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Unban a user (set isBanned to false)
     */
    async unbanUser(id) {
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: { isBanned: false },
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Soft delete a user (set deletedAt to current date)
     */
    async softDeleteUser(id) {
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Restore a soft deleted user (set deletedAt to null)
     */
    async restoreUser(id) {
        const prismaUser = await this.prisma.user.update({
            where: { id },
            data: { deletedAt: null },
        });
        return UserEntity.fromPrisma(prismaUser);
    }
    /**
     * Find user by ID including soft deleted users (for admin operations)
     */
    async findByIdIncludingDeleted(id) {
        const prismaUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!prismaUser) {
            return null;
        }
        return UserEntity.fromPrisma(prismaUser);
    }
}
// Export singleton instance
export const userRepository = new PrismaUserRepository();
//# sourceMappingURL=prisma-user.repository.js.map