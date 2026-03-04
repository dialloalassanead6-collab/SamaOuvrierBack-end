import type { IMissionRepository } from './mission.repository.interface.js';
import { type RequestCancellationInput, type MissionResponse } from '../domain/index.js';
/**
 * Request Cancellation Use Case
 *
 * RESPONSABILITÉ:
 * - Permettre au client ou au worker de demander l'annulation d'une mission en cours
 * - Transitionner vers CANCEL_REQUESTED pour validation Escrow ultérieure
 * - Enregistrer qui a demandé l'annulation
 */
export declare class RequestCancellationUseCase {
    private readonly missionRepository;
    constructor(missionRepository: IMissionRepository);
    /**
     * Exécute la demande d'annulation
     * @param missionId - ID de la mission
     * @param input - Informations sur qui demande l'annulation
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou ne peut pas être annulée
     */
    execute(missionId: string, input: RequestCancellationInput): Promise<MissionResponse>;
}
//# sourceMappingURL=request-cancellation.usecase.d.ts.map