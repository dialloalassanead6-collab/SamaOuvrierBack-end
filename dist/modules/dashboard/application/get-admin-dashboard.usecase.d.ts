import type { IDashboardRepository } from './dashboard.repository.interface.js';
import { type DerivedKpis } from './calculate-kpi.service.js';
import type { AdminDashboardResponse, DashboardPeriod } from '../domain/types/dashboard.types.js';
/**
 * Paramètres d'entrée pour le use case
 */
export interface GetAdminDashboardInput {
    period?: DashboardPeriod;
    startDate?: string;
    endDate?: string;
}
/**
 * Use case pour récupérer les statistiques du dashboard admin
 */
export declare class GetAdminDashboardUseCase {
    private readonly dashboardRepository;
    private readonly kpiService;
    constructor(dashboardRepository: IDashboardRepository);
    /**
     * Exécute le use case
     */
    execute(input?: GetAdminDashboardInput): Promise<AdminDashboardResponse>;
    /**
     * Parse les filtres d'entrée en objet DashboardFilters
     */
    private parseFilters;
    /**
     * Calcule les dates de début et fin pour une période prédéfinie
     */
    private calculatePeriodDates;
}
/**
 * Extension de la réponse avec les KPIs dérivés
 */
export interface AdminDashboardResponseWithKpis extends AdminDashboardResponse {
    derivedKpis: DerivedKpis;
}
//# sourceMappingURL=get-admin-dashboard.usecase.d.ts.map