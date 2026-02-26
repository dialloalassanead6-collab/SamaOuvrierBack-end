import type { IWorkerRepository, PublicServiceResponse } from './worker.repository.interface.js';
/**
 * Erreurs métier pour list-worker-services
 */
export declare class WorkerNotFoundError extends Error {
    constructor(workerId: string);
}
export declare class WorkerNotApprovedError extends Error {
    constructor(workerId: string);
}
/**
 * Input DTO pour list-worker-services
 */
export interface ListWorkerServicesInput {
    /** ID du worker dont on veut récupérer les services */
    workerId: string;
    /** Nombre d'éléments à sauter (pour pagination) */
    skip: number;
    /** Nombre d'éléments à retourner (pour pagination) */
    take: number;
}
/**
 * Output DTO pour list-worker-services
 */
export interface ListWorkerServicesOutput {
    /** Liste des services du worker */
    services: PublicServiceResponse[];
    /** Nombre total de services */
    total: number;
}
/**
 * Use Case: Liste des services d'un worker
 *
 * RESPONSABILITÉS:
 * - Vérifier que le worker existe et est valide (APPROVED, active, non banned)
 * - Orchestrer la logique métier pour lister les services
 * - Déléguer les opérations de données au repository
 * - Retourner les données formatées pour l'API
 *
 * RÈGLES MÉTIER:
 * - Le worker doit exister avec role=WORKER
 * - Le worker doit être isActive=true, isBanned=false, workerStatus=APPROVED
 * - Seuls les services du worker concerné sont retournés
 *
 * CARACTÉRISTIQUES DE SÉCURITÉ:
 * - Vérification stricte du statut du worker avant de retourner les services
 * - Aucune donnée sensible du worker n'est retournée
 * - Les services ne contiennent que les informations nécessaires (id, title, prix, description)
 */
export declare class ListWorkerServicesUseCase {
    private workerRepository;
    constructor(workerRepository: IWorkerRepository);
    /**
     * Exécuter le use case
     *
     * @param input - Paramètres d'entrée (workerId, skip, take)
     * @returns Liste des services du worker avec le total
     * @throws WorkerNotFoundError - Si le worker n'existe pas
     * @throws WorkerNotApprovedError - Si le worker n'est pas valide
     */
    execute(input: ListWorkerServicesInput): Promise<ListWorkerServicesOutput>;
}
//# sourceMappingURL=list-worker-services.usecase.d.ts.map