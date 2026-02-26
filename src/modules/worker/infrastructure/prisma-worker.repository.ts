// ============================================================================
// INFRASTRUCTURE LAYER - Prisma Worker Repository
// ============================================================================
// Implémente IWorkerRepository en utilisant Prisma
// ============================================================================

import { Prisma, PrismaClient, Role, WorkerStatus } from '@prisma/client';
import type { IWorkerRepository } from '../application/index.js';
import type { PublicWorkerResponse, PublicServiceResponse } from '../application/worker.repository.interface.js';

/**
 * Prisma Worker Repository
 * 
 * RESPONSABILITÉS:
 * - Implémenter IWorkerRepository
 * - Gérer toutes les opérations de base de données pour les workers publics
 * - Convertir les modèles Prisma en objets de réponse
 * 
 * CARACTÉRISTIQUES DE SÉCURITÉ:
 * - Utilise Prisma select (pas include) pour éviter l'exposition de données sensibles
 * - Filtre automatiquement les utilisateurs non valides
 * - Ne retourne jamais d'informations sensibles (email, mot de passe, téléphone)
 */
export class PrismaWorkerRepository implements IWorkerRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  /**
   * Trouver les workers publics avec pagination et filtres
   * 
   * Filtres de sécurité automatiques:
   * - role = WORKER
   * - isActive = true
   * - isBanned = false
   * - workerStatus = APPROVED
   * - deletedAt = null
   */
  async findPublicWorkers(
    professionId?: string | undefined,
    skip: number = 0,
    take: number = 10
  ): Promise<{ workers: PublicWorkerResponse[]; total: number }> {
    // Construction des conditions de filtre
    const where: Prisma.UserWhereInput = {
      role: Role.WORKER,
      isActive: true,
      isBanned: false,
      workerStatus: WorkerStatus.APPROVED,
      deletedAt: null,
    };

    // Ajouter le filtre de profession si fourni
    if (professionId) {
      where.professionId = professionId;
    }

    // Exécution des requêtes en parallèle pour la performance
    const [prismaWorkers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        // Utilisation de select pour éviter l'exposition de données sensibles
        select: {
          id: true,
          nom: true,
          prenom: true,
          adresse: true,
          profession: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Transformation des résultats en format de réponse
    const workers: PublicWorkerResponse[] = prismaWorkers.map((worker) => ({
      id: worker.id,
      nom: worker.nom,
      prenom: worker.prenom,
      adresse: worker.adresse,
      profession: worker.profession
        ? {
            id: worker.profession.id,
            name: worker.profession.name,
          }
        : null,
    }));

    return { workers, total };
  }

  /**
   * Vérifier si un worker existe et est valide pour affichage public
   */
  async isValidPublicWorker(workerId: string): Promise<boolean> {
    const worker = await this.prisma.user.findFirst({
      where: {
        id: workerId,
        role: Role.WORKER,
        isActive: true,
        isBanned: false,
        workerStatus: WorkerStatus.APPROVED,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    return worker !== null;
  }

  /**
   * Trouver les services d'un worker spécifique
   * 
   * Retourne uniquement les services avec les champs non sensibles
   */
  async findWorkerServices(
    workerId: string,
    skip: number,
    take: number
  ): Promise<{ services: PublicServiceResponse[]; total: number }> {
    const [prismaServices, total] = await Promise.all([
      this.prisma.service.findMany({
        where: {
          workerId,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        // Utilisation de select pour ne retourner que les champs nécessaires
        select: {
          id: true,
          title: true,
          description: true,
          minPrice: true,
          maxPrice: true,
        },
      }),
      this.prisma.service.count({
        where: {
          workerId,
        },
      }),
    ]);

    // Transformation des résultats en format de réponse
    const services: PublicServiceResponse[] = prismaServices.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      minPrice: Number(service.minPrice),
      maxPrice: Number(service.maxPrice),
    }));

    return { services, total };
  }
}

// Export singleton instance
export const workerRepository = new PrismaWorkerRepository();
