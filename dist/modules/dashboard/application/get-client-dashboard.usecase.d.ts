import type { IDashboardRepository } from './dashboard.repository.interface.js';
import type { ClientDashboardResponse } from '../domain/types/dashboard.types.js';
/**
 * Input pour le use case du dashboard client
 */
export interface GetClientDashboardInput {
    clientId: string;
}
/**
 * Use Case pour récupérer le dashboard du client
 * Contient toute la logique de requêtage Prisma optimisée
 */
export declare class GetClientDashboardUseCase {
    private readonly dashboardRepository;
    constructor(dashboardRepository: IDashboardRepository);
    /**
     * Exécute le use case pour récupérer le dashboard client
     * @param input - ID du client
     * @returns Promise<ClientDashboardResponse>
     */
    execute(input: GetClientDashboardInput): Promise<ClientDashboardResponse>;
}
//# sourceMappingURL=get-client-dashboard.usecase.d.ts.map