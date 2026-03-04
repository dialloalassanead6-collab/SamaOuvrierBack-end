import type { IMissionRepository } from './mission.repository.interface.js';
import type { MissionResponse, MissionWithDetails } from '../domain/index.js';
/**
 * Get Missions Use Case
 *
 * RESPONSABILITÉ:
 * - Récupérer la liste des missions avec pagination
 * - Filtrer par clientId ou workerId si fourni
 * - Retourner les missions avec leurs détails
 */
export declare class GetMissionsUseCase {
    private readonly missionRepository;
    constructor(missionRepository: IMissionRepository);
    /**
     * Exécute la récupération des missions
     * @param skip - Nombre d'enregistrements à ignorer
     * @param take - Nombre d'enregistrements à récupérer
     * @param clientId - Filtrer par client (optionnel)
     * @param workerId - Filtrer par worker (optionnel)
     * @param withDetails - Inclure les détails du client, worker et service
     * @returns Liste des missions et total
     */
    execute(skip: number, take: number, clientId?: string, workerId?: string, withDetails?: boolean): Promise<{
        missions: MissionResponse[];
        total: number;
    }>;
    /**
     * Récupère une mission par ID avec ses détails
     * @param missionId - ID de la mission
     * @returns La mission avec ses détails
     */
    getById(missionId: string): Promise<MissionWithDetails | null>;
}
//# sourceMappingURL=get-missions.usecase.d.ts.map