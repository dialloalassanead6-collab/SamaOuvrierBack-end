import type { Role, WorkerStatus } from '@prisma/client';
/**
 * Registration type sent by client
 */
export type RegistrationType = 'CLIENT' | 'WORKER';
/**
 * JWT Payload structure
 */
export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
    iat?: number;
    exp?: number;
}
/**
 * Auth tokens pair
 */
export interface AuthTokens {
    accessToken: string;
    expiresIn: number;
}
/**
 * Registered user response (without sensitive data)
 */
export interface RegisteredUser {
    id: string;
    nom: string;
    prenom: string;
    adresse: string;
    tel: string;
    email: string;
    role: Role;
    workerStatus: WorkerStatus | null;
    professionId: string | null;
    createdAt: Date;
}
/**
 * User with password (internal use only)
 */
export interface UserWithPassword {
    id: string;
    nom: string;
    prenom: string;
    adresse: string;
    tel: string;
    email: string;
    password: string;
    role: Role;
    workerStatus: WorkerStatus | null;
    professionId: string | null;
    isActive: boolean;
    isBanned: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Login response
 */
export interface LoginResponse {
    user: RegisteredUser;
    token: string;
}
/**
 * Register response
 */
export interface RegisterResponse {
    user: RegisteredUser;
    token: string;
}
/**
 * Input data for client registration
 */
export interface ClientRegisterInput {
    type: 'CLIENT';
    nom: string;
    prenom: string;
    adresse: string;
    tel: string;
    email: string;
    password: string;
}
/**
 * Input data for worker registration
 */
export interface WorkerRegisterInput {
    type: 'WORKER';
    nom: string;
    prenom: string;
    adresse: string;
    tel: string;
    email: string;
    password: string;
    professionId: string;
}
/**
 * Union type for registration input
 */
export type RegisterInput = ClientRegisterInput | WorkerRegisterInput;
/**
 * Profession entity (from domain perspective)
 */
export interface ProfessionEntity {
    id: string;
    name: string;
    description: string | null;
}
//# sourceMappingURL=auth.types.d.ts.map