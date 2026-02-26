// ============================================================================
// APPLICATION LAYER - List Worker Services Use Case
// ============================================================================
// Use case pour lister les services d'un worker spécifique
// ============================================================================
/**
 * Erreurs métier pour list-worker-services
 */
export class WorkerNotFoundError extends Error {
    constructor(workerId) {
        super(`Le worker avec l'ID ${workerId} n'existe pas ou n'est pas disponible.`);
        this.name = 'WorkerNotFoundError';
    }
}
export class WorkerNotApprovedError extends Error {
    constructor(workerId) {
        super(`Le worker avec l'ID ${workerId} n'est pas approuvé ou n'est plus actif.`);
        this.name = 'WorkerNotApprovedError';
    }
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
export class ListWorkerServicesUseCase {
    workerRepository;
    constructor(workerRepository) {
        this.workerRepository = workerRepository;
    }
    /**
     * Exécuter le use case
     *
     * @param input - Paramètres d'entrée (workerId, skip, take)
     * @returns Liste des services du worker avec le total
     * @throws WorkerNotFoundError - Si le worker n'existe pas
     * @throws WorkerNotApprovedError - Si le worker n'est pas valide
     */
    async execute(input) {
        // Validation des paramètres
        if (!input.workerId || input.workerId.trim() === '') {
            throw new Error('L\'ID du worker est requis');
        }
        if (input.skip < 0) {
            throw new Error('Le paramètre skip doit être positif');
        }
        if (input.take < 1) {
            throw new Error('Le paramètre take doit être au moins 1');
        }
        // Vérifier que le worker existe et est valide pour affichage public
        const isValidWorker = await this.workerRepository.isValidPublicWorker(input.workerId);
        if (!isValidWorker) {
            throw new WorkerNotApprovedError(input.workerId);
        }
        // Appel au repository pour récupérer les services du worker
        const result = await this.workerRepository.findWorkerServices(input.workerId, input.skip, input.take);
        return {
            services: result.services,
            total: result.total,
        };
    }
}
//# sourceMappingURL=list-worker-services.usecase.js.map