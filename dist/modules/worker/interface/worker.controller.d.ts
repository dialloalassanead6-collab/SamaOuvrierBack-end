import type { Request, Response, NextFunction } from 'express';
/**
 * Worker Controller
 *
 * RESPONSABILITÉS:
 * - Gérer les requêtes HTTP
 * - Valider les entrées
 * - Appeler les use cases
 * - Formater les réponses HTTP
 *
 * ROUTES PUBLIQUES:
 * - GET /workers/public - Liste des workers publics
 * - GET /workers/:workerId/services - Services d'un worker
 *
 * ROUTES PROTÉGÉES (worker connecté):
 * - GET /workers/me - Mon profil
 * - GET /workers/me/missions - Mes missions
 * - GET /workers/me/services - Mes services
 * - PATCH /workers/me/reapply - Refaire une demande
 */
export declare class WorkerController {
    private reapplyWorkerUseCase;
    private listPublicWorkersUseCase;
    private listWorkerServicesUseCase;
    private getMyProfileUseCase;
    private getMyMissionsUseCase;
    private getMyServicesUseCase;
    constructor();
    /**
     * Lister les workers publics
     * GET /api/workers/public
     *
     * Query params:
     * - professionId (optionnel): Filtrer par profession
     * - page: Numéro de page (via middleware pagination)
     * - pageSize: Taille de page (via middleware pagination)
     */
    listPublicWorkers(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Lister les services d'un worker spécifique
     * GET /api/workers/:workerId/services
     *
     * Params:
     * - workerId: ID du worker
     *
     * Query params:
     * - page: Numéro de page (via middleware pagination)
     * - pageSize: Taille de page (via middleware pagination)
     */
    listWorkerServices(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Refaire une demande de validation
     * PATCH /api/workers/me/reapply
     */
    reapply(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Obtenir mon profil
     * GET /api/workers/me
     */
    getMyProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Obtenir mes missions
     * GET /api/workers/me/missions
     */
    getMyMissions(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    /**
     * Obtenir mes services
     * GET /api/workers/me/services
     */
    getMyServices(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
export declare const workerController: WorkerController;
//# sourceMappingURL=worker.controller.d.ts.map