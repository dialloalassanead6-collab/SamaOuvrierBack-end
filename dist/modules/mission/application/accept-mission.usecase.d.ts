import type { IMissionRepository } from './mission.repository.interface.js';
import { type MissionResponse, type MissionAcceptedEvent } from '../domain/index.js';
import { NotificationService } from '../../notification/index.js';
/**
 * Accept Mission Use Case
 *
 * RESPONSABILITÉ:
 * - Permet au worker d'accepter une mission
 * - Vérifie que le worker est bien assigné à la mission
 * - Met à jour le statut en CONTACT_UNLOCKED
 * - Envoie une notification au client
 */
export declare class AcceptMissionUseCase {
    private readonly missionRepository;
    private readonly notificationService;
    constructor(missionRepository: IMissionRepository, notificationService: NotificationService);
    /**
     * Exécute l'acceptation de la mission
     * @param missionId - ID de la mission à accepter
     * @param workerId - ID du worker qui accepte (doit correspondre au worker assigné)
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou n'est pas en attente d'acceptation
     */
    execute(missionId: string, workerId: string): Promise<{
        mission: MissionResponse;
        event: MissionAcceptedEvent;
    }>;
}
//# sourceMappingURL=accept-mission.usecase.d.ts.map