import type { IMissionRepository } from './mission.repository.interface.js';
import { type ProcessCancellationInput, type MissionResponse } from '../domain/index.js';
/**
 * Process Cancellation Use Case
 *
 * RESPONSABILITÉ:
 * - Traiter une demande d'annulation en attente
 * - Approuver: transitionne vers CANCELLED (nécessite validation Escrow)
 * - Rejeter: transitionne vers IN_PROGRESS (reprise de la mission)
 * - Accessible uniquement par l'autre partie (pas celle qui a demandé)
 */
export declare class ProcessCancellationUseCase {
    private readonly missionRepository;
    constructor(missionRepository: IMissionRepository);
    /**
     * Exécute le traitement de l'annulation
     * @param missionId - ID de la mission
     * @param input - Décision d'approuver ou rejeter
     * @param userId - ID de l'utilisateur qui traite la demande
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou ne peut pas être traitée
     */
    execute(missionId: string, input: ProcessCancellationInput, userId: string): Promise<MissionResponse>;
}
//# sourceMappingURL=process-cancellation.usecase.d.ts.map