import type { IMissionRepository } from './mission.repository.interface.js';
import { type MissionResponse, type MissionRefusedEvent } from '../domain/index.js';
import { NotificationService } from '../../notification/index.js';
/**
 * Refuse Mission Use Case
 *
 * RESPONSABILITÉ:
 * - Permet au worker de refuser une mission
 * - Vérifie que le worker est bien assigné à la mission
 * - Met à jour le statut en REFUSED
 * - Notifie le client du refus
 * - Déclenche le remboursement via le module Payment
 */
export declare class RefuseMissionUseCase {
    private readonly missionRepository;
    private readonly notificationService;
    constructor(missionRepository: IMissionRepository, notificationService: NotificationService);
    /**
     * Exécute le refus de la mission
     * @param missionId - ID de la mission à refuser
     * @param workerId - ID du worker qui refuse (doit correspondre au worker assigné)
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou n'est pas en attente d'acceptation
     */
    execute(missionId: string, workerId: string): Promise<{
        mission: MissionResponse;
        event: MissionRefusedEvent;
    }>;
}
//# sourceMappingURL=refuse-mission.usecase.d.ts.map