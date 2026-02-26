import { PrismaClient } from '@prisma/client';
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
export declare class PrismaWorkerRepository implements IWorkerRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
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
    findPublicWorkers(professionId?: string | undefined, skip?: number, take?: number): Promise<{
        workers: PublicWorkerResponse[];
        total: number;
    }>;
    /**
     * Vérifier si un worker existe et est valide pour affichage public
     */
    isValidPublicWorker(workerId: string): Promise<boolean>;
    /**
     * Trouver les services d'un worker spécifique
     *
     * Retourne uniquement les services avec les champs non sensibles
     */
    findWorkerServices(workerId: string, skip: number, take: number): Promise<{
        services: PublicServiceResponse[];
        total: number;
    }>;
}
export declare const workerRepository: PrismaWorkerRepository;
//# sourceMappingURL=prisma-worker.repository.d.ts.map