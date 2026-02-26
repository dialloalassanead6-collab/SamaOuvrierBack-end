import type { IAuthRepository } from './auth.repository.interface.js';
import type { LoginResponse } from '../domain/index.js';
import type { IPasswordService } from '../../../shared/security/password.service.js';
/**
 * Erreur de connexion
 */
export declare class LoginError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode: number, code: string);
}
/**
 * Identifiants invalides
 */
export declare class InvalidCredentialsError extends LoginError {
    constructor();
}
/**
 * Worker en attente d'approbation
 */
export declare class WorkerNotApprovedError extends LoginError {
    constructor();
}
/**
 * Worker rejeté
 */
export declare class WorkerRejectedError extends LoginError {
    constructor();
}
/**
 * Utilisateur banni
 */
export declare class UserBannedLoginError extends LoginError {
    constructor();
}
/**
 * Utilisateur supprimé
 */
export declare class UserDeletedLoginError extends LoginError {
    constructor();
}
/**
 * Login Use Case
 *
 * RESPONSABILITÉS:
 * - Gérer la logique de connexion
 * - Valider le statut worker (approuvé/rejeté/en attente)
 * - Générer les tokens JWT
 *
 * SOLID Principles:
 * - DIP: Dépend de IPasswordService (abstraction) et IAuthRepository (abstraction)
 * - SRP: Responsabilité unique - gestion de la connexion
 */
export declare class LoginUseCase {
    private readonly authRepository;
    private readonly passwordService;
    private readonly jwtSecret;
    private readonly jwtExpiresIn;
    constructor(authRepository: IAuthRepository, passwordService: IPasswordService);
    /**
     * Exécuter la connexion
     */
    execute(email: string, password: string): Promise<LoginResponse>;
    /**
     * Valider le statut de l'utilisateur avant de permettre la connexion
     * RÈGLES:
     * - isBanned = true → REFUSER connexion
     * - deletedAt != null → REFUSER connexion
     * - isActive = false → PERMETTRE connexion (utilisateur désactivé peut se connecter)
     */
    private validateUserStatus;
    /**
     * Valider le statut du worker avant de permettre la connexion
     * RÈGLES:
     * - Si rôle = WORKER ET workerStatus = PENDING → REFUSER
     * - Si rôle = WORKER ET workerStatus = REJECTED → REFUSER
     * - Seul WORKER avec workerStatus = APPROVED peut se connecter
     * - CLIENT et ADMIN peuvent se connecter normalement
     */
    private validateWorkerStatus;
    /**
     * Générer le token JWT
     */
    private generateToken;
}
//# sourceMappingURL=login.usecase.d.ts.map