// Domain Layer - User Entity
// Represents the core business object "User" with its rules and invariants

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
export class User {
  public readonly id: string;
  public readonly nom: string;
  public readonly prenom: string;
  public readonly adresse: string;
  public readonly tel: string;
  public readonly email: string;
  public readonly role: Role;
  public readonly workerStatus: WorkerStatus | null;
  public readonly rejectionReason: string | null;
  public readonly professionId: string | null;
  public readonly isActive: boolean;
  public readonly isBanned: boolean;
  public readonly deletedAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.nom = props.nom;
    this.prenom = props.prenom;
    this.adresse = props.adresse;
    this.tel = props.tel;
    this.email = props.email;
    this.role = props.role;
    this.workerStatus = props.workerStatus ?? null;
    this.rejectionReason = props.rejectionReason ?? null;
    this.professionId = props.professionId ?? null;
    this.isActive = props.isActive ?? true;
    this.isBanned = props.isBanned ?? false;
    this.deletedAt = props.deletedAt ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  /**
   * Check if user is a client
   */
  isClient(): boolean {
    return this.role === Role.CLIENT;
  }

  /**
   * Check if user is a worker
   */
  isWorker(): boolean {
    return this.role === Role.WORKER;
  }

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
  canReapply(): { canReapply: boolean; reason?: string } {
    // Must be a worker
    if (!this.isWorker()) {
      return { canReapply: false, reason: 'L\'utilisateur n\'est pas un travailleur' };
    }

    // Check if banned
    if (this.isBanned === true) {
      return { canReapply: false, reason: 'Le travailleur est banni' };
    }

    // Check if soft-deleted
    if (this.deletedAt !== null) {
      return { canReapply: false, reason: 'Le compte est supprimé' };
    }

    // Check if already approved
    if (this.workerStatus === WorkerStatus.APPROVED) {
      return { canReapply: false, reason: 'Le travailleur est déjà approuvé' };
    }

    // Check if already pending
    if (this.workerStatus === WorkerStatus.PENDING) {
      return { canReapply: false, reason: 'Le travailleur est déjà en attente de validation' };
    }

    // Must be rejected to reapply
    if (this.workerStatus !== WorkerStatus.REJECTED) {
      return { canReapply: false, reason: 'Le statut du travailleur n\'est pas REJECTED' };
    }

    return { canReapply: true };
  }

  /**
   * Convert to plain object for response (excludes password)
   */
  toResponse(): UserResponse {
    return {
      id: this.id,
      nom: this.nom,
      prenom: this.prenom,
      adresse: this.adresse,
      tel: this.tel,
      email: this.email,
      role: this.role,
      workerStatus: this.workerStatus,
      rejectionReason: this.rejectionReason,
      professionId: this.professionId,
      isActive: this.isActive,
      isBanned: this.isBanned,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to plain object for response including rejection reason
   */
  toResponseWithRejectionReason(): UserResponse {
    return {
      id: this.id,
      nom: this.nom,
      prenom: this.prenom,
      adresse: this.adresse,
      tel: this.tel,
      email: this.email,
      role: this.role,
      workerStatus: this.workerStatus,
      rejectionReason: this.rejectionReason,
      professionId: this.professionId,
      isActive: this.isActive,
      isBanned: this.isBanned,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create User from Prisma entity (Factory method)
   */
  static fromPrisma(user: PrismaUser): User {
    return new User({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      adresse: user.adresse,
      tel: user.tel,
      email: user.email,
      role: user.role,
      workerStatus: user.workerStatus,
      rejectionReason: user.rejectionReason,
      professionId: user.professionId,
      isActive: user.isActive,
      isBanned: user.isBanned,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
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
