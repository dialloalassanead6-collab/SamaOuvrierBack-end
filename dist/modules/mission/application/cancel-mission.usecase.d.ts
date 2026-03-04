import type { IMissionRepository } from './mission.repository.interface.js';
import { NotificationService } from '../../notification/index.js';
/**
 * Cancel Mission Use Case
 *
 * RESPONSABILITÉ:
 * - Annuler une mission
 * - Transitionner vers CANCELLED
 * - Possible depuis plusieurs statuts (sauf COMPLETED et CANCELLED)
 * - Vérifie que l'utilisateur est le client ou le worker de la mission
 * - Notifie les deux parties de l'annulation
 */
export declare class CancelMissionUseCase {
    private readonly missionRepository;
    private readonly notificationService;
    constructor(missionRepository: IMissionRepository, notificationService: NotificationService);
    /**
     * Exécute l'annulation de la mission
     * @param missionId - ID de la mission
     * @param userId - ID de l'utilisateur qui annule (pour vérification d'ownership)
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou ne peut pas être annulée
     */
    execute(missionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=cancel-mission.usecase.d.ts.map