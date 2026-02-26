import type { Request, Response, NextFunction } from 'express';
/**
 * Worker Controller
 *
 * RESPONSABILITÉS:
 * - Gérer les requêtes HTTP
 * - Valider les entrées
 * - Appeler les use cases
 * - Formater les réponses HTTP
 */
export declare class WorkerController {
    private reapplyWorkerUseCase;
    constructor();
    /**
     * Refaire une demande de validation
     * PATCH /api/workers/me/reapply
     */
    reapply(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
export declare const workerController: WorkerController;
//# sourceMappingURL=worker.controller.d.ts.map