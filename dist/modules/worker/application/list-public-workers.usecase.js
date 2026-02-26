// ============================================================================
// APPLICATION LAYER - List Public Workers Use Case
// ============================================================================
// Use case pour lister les workers publics avec pagination et filtres
// ============================================================================
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
export class ListPublicWorkersUseCase {
    workerRepository;
    constructor(workerRepository) {
        this.workerRepository = workerRepository;
    }
    /**
     * Exécuter le use case
     *
     * @param input - Paramètres d'entrée (professionId optionnel, skip, take)
     * @returns Liste des workers publics avec le total
     */
    async execute(input) {
        // Validation des paramètres de pagination
        if (input.skip < 0) {
            throw new Error('Le paramètre skip doit être positif');
        }
        if (input.take < 1) {
            throw new Error('Le paramètre take doit être au moins 1');
        }
        // Appel au repository pour récupérer les workers publics
        const result = await this.workerRepository.findPublicWorkers(input.professionId, input.skip, input.take);
        return {
            workers: result.workers,
            total: result.total,
        };
    }
}
//# sourceMappingURL=list-public-workers.usecase.js.map