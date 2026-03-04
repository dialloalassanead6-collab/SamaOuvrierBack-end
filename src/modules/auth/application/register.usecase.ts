// ============================================================================
// USE CASE D'INSCRIPTION
// ============================================================================
// Contient la logique métier pour l'inscription d'un nouvel utilisateur.
// Ce use case:
// - Gère l'inscription client et worker
// - Valide les règles métier (rôle, profession)
// - Utilise les messages centralisés pour les erreurs
// ============================================================================

import { Role, WorkerStatus } from '@prisma/client';
import type { IAuthRepository, CreateUserData } from './auth.repository.interface.js';
import type { RegisterResponse, ClientRegisterInput, WorkerRegisterInput } from '../domain/index.js';
import { AUTH_MESSAGES, ERROR_CODES, HTTP_STATUS } from '../../../shared/constants/messages.js';
import type { IPasswordService } from '../../../shared/security/password.service.js';

/**
 * Erreur d'inscription
 */
export class RegistrationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'RegistrationError';
  }
}

/**
 * Profession non trouvée
 */
export class ProfessionNotFoundError extends RegistrationError {
  constructor() {
    super(
      AUTH_MESSAGES.PROFESSION_NOT_FOUND,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.PROFESSION_NOT_FOUND
    );
    this.name = 'ProfessionNotFoundError';
  }
}

/**
 * Aucune profession disponible
 */
export class NoProfessionAvailableError extends RegistrationError {
  constructor() {
    super(
      AUTH_MESSAGES.NO_PROFESSION_AVAILABLE,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.NO_PROFESSION
    );
    this.name = 'NoProfessionAvailableError';
  }
}

/**
 * Email déjà utilisé
 */
export class EmailAlreadyExistsError extends RegistrationError {
  constructor() {
    super(
      AUTH_MESSAGES.EMAIL_ALREADY_EXISTS,
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.EMAIL_EXISTS
    );
    this.name = 'EmailAlreadyExistsError';
  }
}

/**
 * Inscription admin interdite
 */
export class AdminRegistrationForbiddenError extends RegistrationError {
  constructor() {
    super(
      AUTH_MESSAGES.ADMIN_REGISTRATION_FORBIDDEN,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.ADMIN_FORBIDDEN
    );
    this.name = 'AdminRegistrationForbiddenError';
  }
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
export class RegisterUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: IPasswordService
  ) {}

  /**
   * Exécuter l'inscription client
   */
  async executeClient(input: ClientRegisterInput): Promise<RegisterResponse> {
    // 1. Vérifier que l'email n'existe pas
    await this.checkEmailNotExists(input.email);

    // 2. Hasher le mot de passe
    const hashedPassword = await this.passwordService.hash(input.password);

    // 3. Créer l'utilisateur avec le rôle CLIENT
    const userData: CreateUserData = {
      nom: input.nom,
      prenom: input.prenom,
      adresse: input.adresse,
      tel: input.tel,
      email: input.email,
      password: hashedPassword,
      role: Role.CLIENT,
    };

    // 4. Sauvegarder en base de données
    const user = await this.authRepository.createUser(userData);

    // 5. Retourner le résultat (le token sera généré par le service)
    return {
      user,
      token: '', // Token généré par AuthService
    };
  }

  /**
   * Exécuter l'inscription worker
   */
  async executeWorker(input: WorkerRegisterInput): Promise<RegisterResponse> {
    // 1. Vérifier qu'il existe au moins une profession
    const hasProfession = await this.authRepository.hasAnyProfession();
    if (!hasProfession) {
      throw new NoProfessionAvailableError();
    }

    // 2. Vérifier que la profession existe
    const profession = await this.authRepository.findProfessionById(input.professionId);
    if (!profession) {
      throw new ProfessionNotFoundError();
    }

    // 3. Vérifier que l'email n'existe pas
    await this.checkEmailNotExists(input.email);

    // 4. Hasher le mot de passe
    const hashedPassword = await this.passwordService.hash(input.password);

    // 5. Créer l'utilisateur avec le rôle WORKER et le statut PENDING
    const userData: CreateUserData = {
      nom: input.nom,
      prenom: input.prenom,
      adresse: input.adresse,
      tel: input.tel,
      email: input.email,
      password: hashedPassword,
      role: Role.WORKER,
      workerStatus: WorkerStatus.PENDING,
      professionId: input.professionId,
      
      // ✅ Document URLs from Cloudinary
      identityCardRecto: input.identityCardRecto.url,
      identityCardVerso: input.identityCardVerso.url,
      diploma: input.diploma?.url ?? null,
    };

    // 6. Sauvegarder en base de données
    const user = await this.authRepository.createUser(userData);

    // 7. Retourner le résultat
    return {
      user,
      token: '', // Token généré par AuthService
    };
  }

  /**
   * Valider le type d'inscription et exécuter le handler approprié
   */
  async execute(input: ClientRegisterInput | WorkerRegisterInput): Promise<RegisterResponse> {
    // SÉCURITÉ: Rejeter explicitement ADMIN (validation défensive)
    if (input.type === 'CLIENT') {
      return this.executeClient(input);
    }

    if (input.type === 'WORKER') {
      return this.executeWorker(input);
    }

    // Ceci ne devrait jamais arriver si la validation est correcte
    throw new AdminRegistrationForbiddenError();
  }

  /**
   * Vérifier si l'email existe déjà
   */
  private async checkEmailNotExists(email: string): Promise<void> {
    const exists = await this.authRepository.existsByEmail(email);
    if (exists) {
      throw new EmailAlreadyExistsError();
    }
  }
}
