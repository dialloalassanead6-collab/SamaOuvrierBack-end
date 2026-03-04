import type { IUserRepository } from '../../user/application/index.js';
import type { IMissionRepository } from '../../mission/application/index.js';
import type { MissionWithDetails } from '../../mission/domain/index.js';
/**
 * Input DTO pour get-my-missions
 */
export interface GetMyMissionsInput {
    /** ID du worker (extrait du JWT) */
    workerId: string;
    /** Nombre d'enregistrements à ignorer */
    skip?: number;
    /** Nombre d'enregistrements à récupérer */
    take?: number;
}
/**
 * Output DTO pour get-my-missions
 */
export interface GetMyMissionsOutput {
    /** Liste des missions */
    missions: MissionWithDetails[];
    /** Nombre total */
    total: number;
}
/**
 * Use Case: Obtenir les missions du worker connecté
 *
 * RESPONSABILITÉS:
 * - Vérifier que le worker existe
 * - Vérifier que l'utilisateur est un worker (role = WORKER)
 * - Vérifier que le worker est approuvé (workerStatus = APPROVED)
 * - Vérifier que le compte n'est pas soft-deleted
 * - Retourner les missions du worker
 *
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 */
export declare class GetMyMissionsUseCase {
    private readonly userRepository;
    private readonly missionRepository;
    constructor(userRepository: IUserRepository, missionRepository: IMissionRepository);
    /**
     * Exécuter le use case
     */
    execute(input: GetMyMissionsInput): Promise<GetMyMissionsOutput>;
}
//# sourceMappingURL=get-my-missions.usecase.d.ts.map