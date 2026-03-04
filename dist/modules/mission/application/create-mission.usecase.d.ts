import type { IMissionRepository } from './mission.repository.interface.js';
import type { IServiceRepository } from '../../service/application/service.repository.interface.js';
import { type CreateMissionInput, type MissionResponse } from '../domain/index.js';
/**
 * Create Mission Use Case
 *
 * RESPONSABILITÉ:
 * - Créer une nouvelle mission avec les données fournies
 * - Valider que le service existe et appartient au worker
 * - Valider que l'utilisateur connecté est le client
 * - Récupérer les prix min/max depuis le Service (règle métier)
 * - Initialiser le statut à PENDING_PAYMENT
 */
export declare class CreateMissionUseCase {
    private readonly missionRepository;
    private readonly serviceRepository;
    constructor(missionRepository: IMissionRepository, serviceRepository: IServiceRepository);
    /**
     * Exécute la création d'une mission
     * @param input - Données de création de la mission (workerId, serviceId)
     * @param authenticatedUserId - ID de l'utilisateur authentifié (sera le clientId)
     * @returns La mission créée
     * @throws BusinessError si les données sont invalides
     */
    execute(input: CreateMissionInput, authenticatedUserId: string): Promise<MissionResponse>;
    /**
     * Valide les données d'entrée
     */
    private validateInput;
}
//# sourceMappingURL=create-mission.usecase.d.ts.map