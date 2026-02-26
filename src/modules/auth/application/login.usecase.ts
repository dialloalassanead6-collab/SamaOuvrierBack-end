// ============================================================================
// USE CASE DE CONNEXION
// ============================================================================
// Contient la logique métier pour l'authentification des utilisateurs.
// ============================================================================

import { Role, WorkerStatus } from '@prisma/client';
import type { IAuthRepository } from './auth.repository.interface.js';
import type { RegisteredUser, LoginResponse, UserWithPassword } from '../domain/index.js';
import type { IPasswordService } from '../../../shared/security/password.service.js';
import { config } from '../../../shared/config/config.js';
import { AUTH_MESSAGES, ERROR_CODES, HTTP_STATUS } from '../../../shared/constants/messages.js';
import jwt from 'jsonwebtoken';

/**
 * Erreur de connexion
 */
export class LoginError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'LoginError';
  }
}

/**
 * Identifiants invalides
 */
export class InvalidCredentialsError extends LoginError {
  constructor() {
    super(
      AUTH_MESSAGES.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_CREDENTIALS
    );
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Worker en attente d'approbation
 */
export class WorkerNotApprovedError extends LoginError {
  constructor() {
    super(
      AUTH_MESSAGES.ACCOUNT_PENDING,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.ACCOUNT_PENDING
    );
    this.name = 'WorkerNotApprovedError';
  }
}

/**
 * Worker rejeté
 */
export class WorkerRejectedError extends LoginError {
  constructor() {
    super(
      AUTH_MESSAGES.ACCOUNT_REJECTED,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.ACCOUNT_REJECTED
    );
    this.name = 'WorkerRejectedError';
  }
}

/**
 * Utilisateur banni
 */
export class UserBannedLoginError extends LoginError {
  constructor() {
    super(
      AUTH_MESSAGES.ACCOUNT_BANNED,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.USER_BANNED
    );
    this.name = 'UserBannedLoginError';
  }
}

/**
 * Utilisateur supprimé
 */
export class UserDeletedLoginError extends LoginError {
  constructor() {
    super(
      AUTH_MESSAGES.ACCOUNT_DELETED,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.USER_DELETED
    );
    this.name = 'UserDeletedLoginError';
  }
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
export class LoginUseCase {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: IPasswordService
  ) {
    this.jwtSecret = config.JWT_SECRET;
    this.jwtExpiresIn = config.JWT_EXPIRES_IN;
  }

  /**
   * Exécuter la connexion
   */
  async execute(email: string, password: string): Promise<LoginResponse> {
    // 1. Rechercher l'utilisateur avec le hash du mot de passe
    const userWithPassword = await this.authRepository.findByEmailWithPassword(email);

    if (!userWithPassword) {
      throw new InvalidCredentialsError();
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await this.passwordService.compare(password, userWithPassword.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 3. Vérifier le statut du utilisateur (banni / supprimé)
    // RÈGLE MÉTIER: Banni → refuse connexion | Supprimé → refuse connexion
    this.validateUserStatus(userWithPassword);

    // 4. Vérifier le statut du worker
    this.validateWorkerStatus(userWithPassword);

    // 5. Générer le token JWT
    const token = this.generateToken(userWithPassword);

    // 6. Retourner l'utilisateur sans le mot de passe
    const user: RegisteredUser = {
      id: userWithPassword.id,
      nom: userWithPassword.nom,
      prenom: userWithPassword.prenom,
      adresse: userWithPassword.adresse,
      tel: userWithPassword.tel,
      email: userWithPassword.email,
      role: userWithPassword.role,
      workerStatus: userWithPassword.workerStatus,
      professionId: userWithPassword.professionId,
      createdAt: userWithPassword.createdAt,
    };

    return {
      user,
      token,
    };
  }

  /**
   * Valider le statut de l'utilisateur avant de permettre la connexion
   * RÈGLES:
   * - isBanned = true → REFUSER connexion
   * - deletedAt != null → REFUSER connexion
   * - isActive = false → PERMETTRE connexion (utilisateur désactivé peut se connecter)
   */
  private validateUserStatus(user: UserWithPassword): void {
    // Vérifier si l'utilisateur est banni
    if (user.isBanned) {
      throw new UserBannedLoginError();
    }

    // Vérifier si l'utilisateur est supprimé (soft delete)
    if (user.deletedAt !== null) {
      throw new UserDeletedLoginError();
    }
  }

  /**
   * Valider le statut du worker avant de permettre la connexion
   * RÈGLES:
   * - Si rôle = WORKER ET workerStatus = PENDING → REFUSER
   * - Si rôle = WORKER ET workerStatus = REJECTED → REFUSER
   * - Seul WORKER avec workerStatus = APPROVED peut se connecter
   * - CLIENT et ADMIN peuvent se connecter normalement
   */
  private validateWorkerStatus(user: UserWithPassword): void {
    if (user.role === Role.WORKER) {
      if (user.workerStatus === WorkerStatus.PENDING) {
        throw new WorkerNotApprovedError();
      }
      if (user.workerStatus === WorkerStatus.REJECTED) {
        throw new WorkerRejectedError();
      }
    }
  }

  /**
   * Générer le token JWT
   */
  private generateToken(user: UserWithPassword): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}
