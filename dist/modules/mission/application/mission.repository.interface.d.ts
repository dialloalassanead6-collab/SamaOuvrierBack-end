import type { Mission, MissionWithDetails } from '../domain/index.js';
/**
 * Input pour créer une mission (sans clientId - vient de l'authentification)
 */
export interface CreateMissionInput {
    clientId: string;
    workerId: string;
    serviceId: string;
    prixMin: number;
    prixMax: number;
}
/**
 * Mission Repository Interface
 *
 * Contrat spécialisé pour les opérations sur les missions
 * Implémentée par PrismaMissionRepository
 */
export interface IMissionRepository {
    /**
     * Trouve une mission par son @param id - ID
     * ID de la mission
     */
    findById(id: string): Promise<Mission | null>;
    /**
     * Trouve une mission par son ID avec les détails associés (client, worker, service)
     * @param id - ID de la mission
     */
    findByIdWithDetails(id: string): Promise<MissionWithDetails | null>;
    /**
     * Trouve toutes les missions avec pagination
     * @param skip - Nombre d'enregistrements à ignorer
     * @param take - Nombre d'enregistrements à récupérer
     * @param clientId - Filtrer par client (optionnel)
     * @param workerId - Filtrer par worker (optionnel)
     */
    findAll(skip: number, take: number, clientId?: string, workerId?: string): Promise<{
        missions: Mission[];
        total: number;
    }>;
    /**
     * Trouve toutes les missions avec leurs détails
     */
    findAllWithDetails(skip: number, take: number, clientId?: string, workerId?: string): Promise<{
        missions: MissionWithDetails[];
        total: number;
    }>;
    /**
     * Crée une nouvelle mission
     * @param input - Données de création de la mission
     */
    create(input: CreateMissionInput): Promise<Mission>;
    /**
     * Met à jour une mission existante
     * @param id - ID de la mission
     * @param mission - Nouvelle instance de Mission avec les mises à jour
     */
    update(id: string, mission: Mission): Promise<Mission>;
    /**
     * Supprime une mission
     * @param id - ID de la mission
     */
    delete(id: string): Promise<void>;
    /**
     * Vérifie si un service appartient à un worker
     * @param serviceId - ID du service
     * @param workerId - ID du worker
     */
    verifyServiceOwnership(serviceId: string, workerId: string): Promise<boolean>;
    /**
     * Trouve les missions par IDs de client
     */
    findByClientId(clientId: string): Promise<Mission[]>;
    /**
     * Trouve les missions par IDs de worker
     */
    findByWorkerId(workerId: string): Promise<Mission[]>;
}
//# sourceMappingURL=mission.repository.interface.d.ts.map