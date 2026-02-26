import type { IAuthRepository } from './auth.repository.interface.js';
import type { RegisterResponse, ClientRegisterInput, WorkerRegisterInput } from '../domain/index.js';
import type { IPasswordService } from '../../../shared/security/password.service.js';
/**
 * Erreur d'inscription
 */
export declare class RegistrationError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode: number, code: string);
}
/**
 * Profession non trouvée
 */
export declare class ProfessionNotFoundError extends RegistrationError {
    constructor();
}
/**
 * Aucune profession disponible
 */
export declare class NoProfessionAvailableError extends RegistrationError {
    constructor();
}
/**
 * Email déjà utilisé
 */
export declare class EmailAlreadyExistsError extends RegistrationError {
    constructor();
}
/**
 * Inscription admin interdite
 */
export declare class AdminRegistrationForbiddenError extends RegistrationError {
    constructor();
}
/**
 * Register Use Case
 *
 * RESPONSABILITÉS:
 * - Gérer la logique métier d'inscription
 * - Appliquer les règles métier (rôle, profession)
 * - Coordonner entre repository et domaine
 *
 * SOLID Principles:
 * - DIP: Dépend de IPasswordService (abstraction) et IAuthRepository (abstraction)
 * - SRP: Responsabilité unique - gestion de l'inscription
 */
export declare class RegisterUseCase {
    private readonly authRepository;
    private readonly passwordService;
    constructor(authRepository: IAuthRepository, passwordService: IPasswordService);
    /**
     * Exécuter l'inscription client
     */
    executeClient(input: ClientRegisterInput): Promise<RegisterResponse>;
    /**
     * Exécuter l'inscription worker
     */
    executeWorker(input: WorkerRegisterInput): Promise<RegisterResponse>;
    /**
     * Valider le type d'inscription et exécuter le handler approprié
     */
    execute(input: ClientRegisterInput | WorkerRegisterInput): Promise<RegisterResponse>;
    /**
     * Vérifier si l'email existe déjà
     */
    private checkEmailNotExists;
}
//# sourceMappingURL=register.usecase.d.ts.map