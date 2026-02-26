import type { IWorkerRepository, PublicWorkerResponse } from './worker.repository.interface.js';
/**
 * Input DTO pour list-public-workers
 */
export interface ListPublicWorkersInput {
    /** Filtre optionnel par ID de profession */
    professionId: string | undefined;
    /** Nombre d'éléments à sauter (pour pagination) */
    skip: number;
    /** Nombre d'éléments à retourner (pour pagination) */
    take: number;
}
/**
 * Output DTO pour list-public-workers
 */
export interface ListPublicWorkersOutput {
    /** Liste des workers publics */
    workers: PublicWorkerResponse[];
    /** Nombre total de workers correspondants */
    total: number;
}
/**
 * Use Case: Liste des workers publics
 *
 * RESPONSABILITÉS:
 * - Orchestrer la logique métier pour lister les workers publics
 * - Déléguer les opérations de données au repository
 * - Retourner les données formatées pour l'API
 *
 * RÈGLES MÉTIER:
 * - Seuls les workers avec role=WORKER, isActive=true, isBanned=false,
 *   workerStatus=APPROVED sont retournés (filtres appliqués par le repository)
 * - Filtrage optionnel par professionId
 * - Pagination gérée via skip et take
 *
 * CARACTÉRISTIQUES DE SÉCURITÉ:
 * - Le repository filtre automatiquement les workers non valides
 * - Aucune donnée sensible n'est retournée (email, téléphone, mot de passe)
 */
export declare class ListPublicWorkersUseCase {
    private workerRepository;
    constructor(workerRepository: IWorkerRepository);
    /**
     * Exécuter le use case
     *
     * @param input - Paramètres d'entrée (professionId optionnel, skip, take)
     * @returns Liste des workers publics avec le total
     */
    execute(input: ListPublicWorkersInput): Promise<ListPublicWorkersOutput>;
}
//# sourceMappingURL=list-public-workers.usecase.d.ts.map