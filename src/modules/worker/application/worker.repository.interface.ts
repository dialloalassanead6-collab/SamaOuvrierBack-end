// ============================================================================
// APPLICATION LAYER - Worker Repository Interface
// ============================================================================
// Interface pour les opérations de données des workers publics
// ============================================================================

/**
 * Données publiques d'un worker pour la réponse API
 */
export interface PublicWorkerResponse {
  id: string;
  nom: string;
  prenom: string;
  adresse: string;
  profession: {
    id: string;
    name: string;
  } | null;
}

/**
 * Données d'un service pour la réponse API
 */
export interface PublicServiceResponse {
  id: string;
  title: string;
  minPrice: number;
  maxPrice: number;
  description: string;
}

/**
 * Interface du repository worker
 * 
 * RESPONSABILITÉS:
 * - Définir le contrat pour les opérations de données worker
 * - Indépendant de la technologie de base de données
 * - Suit le principe de Dependency Inversion
 */
export interface IWorkerRepository {
  /**
   * Trouver les workers publics avec pagination et filtres
   * 
   * Filtres automatiques:
   * - role = WORKER
   * - isActive = true
   * - isBanned = false
   * - workerStatus = APPROVED
   * 
   * @param professionId - Filtre optionnel par profession
   * @param skip - Nombre d'éléments à sauter
   * @param take - Nombre d'éléments à retourner
   */
  findPublicWorkers(
    professionId?: string | undefined,
    skip?: number,
    take?: number
  ): Promise<{ workers: PublicWorkerResponse[]; total: number }>;

  /**
   * Vérifier si un worker existe et est valide pour affichage public
   * 
   * @param workerId - ID du worker à vérifier
   * @returns true si le worker est valide (existe, WORKER, APPROVED, active, non banned)
   */
  isValidPublicWorker(workerId: string): Promise<boolean>;

  /**
   * Trouver les services d'un worker spécifique
   * 
   * @param workerId - ID du worker
   * @param skip - Nombre d'éléments à sauter
   * @param take - Nombre d'éléments à retourner
   */
  findWorkerServices(
    workerId: string,
    skip: number,
    take: number
  ): Promise<{ services: PublicServiceResponse[]; total: number }>;
}
