import { Role, WorkerStatus, type User as PrismaUser } from '@prisma/client';
/**
 * User Entity - Core domain object
 *
 * RESPONSIBILITIES:
 * - Represent a user in the domain
 * - Encapsulate user-related business rules
 * - Be independent of any framework (Prisma, Express, etc.)
 *
 * INVARIANTS:
 * - Email must be unique and valid
 * - Password must meet security requirements
 * - Role must be one of: ADMIN, CLIENT, WORKER
 */
export declare class User {
    readonly id: string;
    readonly nom: string;
    readonly prenom: string;
    readonly adresse: string;
    readonly tel: string;
    readonly email: string;
    readonly role: Role;
    readonly workerStatus: WorkerStatus | null;
    readonly rejectionReason: string | null;
    readonly professionId: string | null;
    readonly isActive: boolean;
    readonly isBanned: boolean;
    readonly deletedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: UserProps);
    /**
     * Check if user is an admin
     */
    isAdmin(): boolean;
    /**
     * Check if user is a client
     */
    isClient(): boolean;
    /**
     * Check if user is a worker
     */
    isWorker(): boolean;
    /**
     * Check if worker can reapply for validation
     *
     * BUSINESS RULE: A worker can reapply ONLY if:
     * - workerStatus === REJECTED
     * - isBanned === false
     * - deletedAt === null
     *
     * Returns an object with the result and reason for logging/debugging
     */
    canReapply(): {
        canReapply: boolean;
        reason?: string;
    };
    /**
     * Convert to plain object for response (excludes password)
     */
    toResponse(): UserResponse;
    /**
     * Convert to plain object for response including rejection reason
     */
    toResponseWithRejectionReason(): UserResponse;
    /**
     * Create User from Prisma entity (Factory method)
     */
    static fromPrisma(user: PrismaUser): User;
}
/**
 * User properties interface - defines what User needs to be created
 */
export interface UserProps {
    id: string;
    nom: string;
    prenom: string;
    adresse: string;
    tel: string;
    email: string;
    role: Role;
    workerStatus?: WorkerStatus | null;
    rejectionReason?: string | null;
    professionId?: string | null;
    isActive?: boolean;
    isBanned?: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * User response DTO (without sensitive data)
 */
export interface UserResponse {
    id: string;
    nom: string;
    prenom: string;
    adresse: string;
    tel: string;
    email: string;
    role: Role;
    workerStatus: WorkerStatus | null;
    rejectionReason: string | null;
    professionId: string | null;
    isActive: boolean;
    isBanned: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * User create input DTO
 */
export interface CreateUserInput {
    nom: string;
    prenom: string;
    adresse: string;
    tel: string;
    email: string;
    password: string;
    role?: Role;
    professionId?: string;
}
/**
 * User update input DTO
 */
export interface UpdateUserInput {
    nom?: string;
    prenom?: string;
    adresse?: string;
    tel?: string;
    email?: string;
    role?: Role;
}
/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}
/**
 * Authentication result
 */
export interface AuthResult {
    user: UserResponse;
    token: string;
}
//# sourceMappingURL=user.entity.d.ts.map