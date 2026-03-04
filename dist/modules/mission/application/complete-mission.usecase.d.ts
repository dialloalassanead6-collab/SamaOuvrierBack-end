import type { IMissionRepository } from './mission.repository.interface.js';
import { type MissionResponse, type MissionCompletedEvent } from '../domain/index.js';
import { NotificationService } from '../../notification/index.js';
/**
 * Input pour la complétion de mission
 */
export interface CompleteMissionInput {
    userId: string;
    userRole: 'CLIENT' | 'WORKER';
}
/**
 * Complete Mission Use Case
 *
 * RESPONSABILITÉ:
 * - Permet au client ou worker de confirmer la complétion de la mission
 * - Nécessite confirmation des deux parties pour passer à COMPLETED
 * - Envoie une notification quand la mission est terminée
 */
export declare class CompleteMissionUseCase {
    private readonly missionRepository;
    private readonly notificationService;
    constructor(missionRepository: IMissionRepository, notificationService: NotificationService);
    /**
     * Exécute la complétion de la mission
     * @param missionId - ID de la mission
     * @param input - ID et rôle de l'utilisateur qui confirme
     * @returns La mission mise à jour et l'événement (si complétée)
     * @throws BusinessError si la mission n'existe pas ou ne peut pas être terminée
     */
    execute(missionId: string, input: CompleteMissionInput): Promise<{
        mission: MissionResponse;
        event?: MissionCompletedEvent;
    } | void>;
}
//# sourceMappingURL=complete-mission.usecase.d.ts.map