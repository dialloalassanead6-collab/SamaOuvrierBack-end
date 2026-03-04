import type { IUserRepository } from '../../user/application/index.js';
import type { IServiceRepository } from '../../service/application/index.js';
import type { Service } from '../../service/domain/index.js';
/**
 * Input DTO pour get-my-services
 */
export interface GetMyServicesInput {
    /** ID du worker (extrait du JWT) */
    workerId: string;
    /** Nombre d'enregistrements à ignorer */
    skip?: number;
    /** Nombre d'enregistrements à récupérer */
    take?: number;
}
/**
 * Output DTO pour get-my-services
 */
export interface GetMyServicesOutput {
    /** Liste des services */
    services: Service[];
    /** Nombre total */
    total: number;
}
/**
 * Use Case: Obtenir les services du worker connecté
 *
 * RESPONSABILITÉS:
 * - Vérifier que le worker existe
 * - Vérifier que l'utilisateur est un worker (role = WORKER)
 * - Vérifier que le worker est approuvé (workerStatus = APPROVED)
 * - Vérifier que le compte n'est pas soft-deleted
 * - Retourner les services du worker
 *
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 */
export declare class GetMyServicesUseCase {
    private readonly userRepository;
    private readonly serviceRepository;
    constructor(userRepository: IUserRepository, serviceRepository: IServiceRepository);
    /**
     * Exécuter le use case
     */
    execute(input: GetMyServicesInput): Promise<GetMyServicesOutput>;
}
//# sourceMappingURL=get-my-services.usecase.d.ts.map