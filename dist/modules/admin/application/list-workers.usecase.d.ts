import { WorkerStatus } from '@prisma/client';
import type { IUserRepository } from '../../user/application/index.js';
import type { User } from '../../user/domain/index.js';
/**
 * Paramètres d'entrée pour le use case ListWorkers
 */
export interface ListWorkersInput {
    /** Statut du worker (optionnel) */
    status?: WorkerStatus | undefined;
    /** Nombre d'éléments à ignorer (pagination) */
    skip?: number;
    /** Nombre d'éléments à récupérer (pagination) */
    take?: number;
}
/**
 * Résultat du use case ListWorkers
 */
export interface ListWorkersOutput {
    /** Liste des utilisateurs travailleurs */
    users: User[];
    /** Nombre total de travailleurs */
    total: number;
    /** Statut filtré (si fourni) */
    status?: WorkerStatus | undefined;
}
/**
 * Use case pour lister les travailleurs avec filtre optionnel par statut
 *
 * RESPONSABILITÉS:
 * - Valider les paramètres d'entrée
 * - Récupérer les travailleurs selon le filtre
 * - Retourner la liste paginée
 */
export declare class ListWorkersUseCase {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    /**
     * Exécuter le use case
     */
    execute(input: ListWorkersInput): Promise<ListWorkersOutput>;
}
//# sourceMappingURL=list-workers.usecase.d.ts.map