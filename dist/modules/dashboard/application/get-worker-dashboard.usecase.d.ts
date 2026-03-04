import type { IDashboardRepository } from './dashboard.repository.interface.js';
import type { WorkerDashboardResponse } from '../domain/types/dashboard.types.js';
/**
 * Input pour le use case du dashboard worker
 */
export interface GetWorkerDashboardInput {
    workerId: string;
}
/**
 * Use Case pour récupérer le dashboard du worker
 * Contient toute la logique de requêtage Prisma optimisée
 */
export declare class GetWorkerDashboardUseCase {
    private readonly dashboardRepository;
    constructor(dashboardRepository: IDashboardRepository);
    /**
     * Exécute le use case pour récupérer le dashboard worker
     * @param input - ID du worker
     * @returns Promise<WorkerDashboardResponse>
     */
    execute(input: GetWorkerDashboardInput): Promise<WorkerDashboardResponse>;
}
//# sourceMappingURL=get-worker-dashboard.usecase.d.ts.map