// Infrastructure Layer - Prisma Auth Repository
// Implements IAuthRepository using Prisma

import { PrismaClient } from '@prisma/client';
import type { IAuthRepository, CreateUserData } from '../application/index.js';
import type { UserWithPassword, RegisteredUser, ProfessionEntity } from '../domain/index.js';

/**
 * Prisma Auth Repository
 * 
 * RESPONSABILITIES:
 * - Implement IAuthRepository interface
 * - Handle all authentication-related database operations
 * - Convert between Prisma models and domain types
 * 
 * Following Dependency Inversion Principle:
 * - The interface is defined in the application layer
 * - This implementation is in the infrastructure layer
 * - Services depend on the abstraction, not the implementation
 */
export class PrismaAuthRepository implements IAuthRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  /**
   * Find user by email including password hash
   */
  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) {
      return null;
    }

    return {
      id: prismaUser.id,
      nom: prismaUser.nom,
      prenom: prismaUser.prenom,
      adresse: prismaUser.adresse,
      tel: prismaUser.tel,
      email: prismaUser.email,
      password: prismaUser.password,
      role: prismaUser.role,
      workerStatus: prismaUser.workerStatus,
      professionId: prismaUser.professionId,
      isActive: prismaUser.isActive,
      isBanned: prismaUser.isBanned,
      deletedAt: prismaUser.deletedAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  /**
   * Find user by ID (without password)
   */
  async findById(id: string): Promise<RegisteredUser | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return {
      id: prismaUser.id,
      nom: prismaUser.nom,
      prenom: prismaUser.prenom,
      adresse: prismaUser.adresse,
      tel: prismaUser.tel,
      email: prismaUser.email,
      role: prismaUser.role,
      workerStatus: prismaUser.workerStatus,
      professionId: prismaUser.professionId,
      createdAt: prismaUser.createdAt,
    };
  }

  /**
   * Check if email already exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Create a new user with hashed password
   */
  async createUser(data: CreateUserData): Promise<RegisteredUser> {
    const prismaUser = await this.prisma.user.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        tel: data.tel,
        email: data.email,
        password: data.password,
        role: data.role,
        workerStatus: data.workerStatus ?? null,
        professionId: data.professionId ?? null,
        
        // ✅ Worker document URLs
        identityCardRecto: data.identityCardRecto ?? null,
        identityCardVerso: data.identityCardVerso ?? null,
        diploma: data.diploma ?? null,
      },
    });

    return {
      id: prismaUser.id,
      nom: prismaUser.nom,
      prenom: prismaUser.prenom,
      adresse: prismaUser.adresse,
      tel: prismaUser.tel,
      email: prismaUser.email,
      role: prismaUser.role,
      workerStatus: prismaUser.workerStatus,
      professionId: prismaUser.professionId,
      createdAt: prismaUser.createdAt,
    };
  }

  /**
   * Find profession by ID
   */
  async findProfessionById(id: string): Promise<ProfessionEntity | null> {
    const profession = await this.prisma.profession.findUnique({
      where: { id },
    });

    if (!profession) {
      return null;
    }

    return {
      id: profession.id,
      name: profession.name,
      description: profession.description,
    };
  }

  /**
   * Check if any profession exists in database
   */
  async hasAnyProfession(): Promise<boolean> {
    const count = await this.prisma.profession.count();
    return count > 0;
  }
}

// Export singleton instance
export const authRepository = new PrismaAuthRepository();
