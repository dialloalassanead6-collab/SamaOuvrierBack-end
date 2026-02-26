// ============================================================================
// INTERFACE LAYER - Worker Controller
// ============================================================================
// Gère les requêtes HTTP pour les opérations du travailleur
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import {
  ReapplyWorkerUseCase,
  ListPublicWorkersUseCase,
  ListWorkerServicesUseCase,
  WorkerNotApprovedError,
} from '../application/index.js';
import { workerRepository } from '../infrastructure/index.js';
import { userRepository } from '../../user/infrastructure/index.js';
import { sendSuccess, sendNotFound, sendError } from '../../../shared/utils/index.js';
import { getPaginationMetadata } from '../../../shared/middleware/index.js';

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
 */
export class WorkerController {
  private reapplyWorkerUseCase: ReapplyWorkerUseCase;
  private listPublicWorkersUseCase: ListPublicWorkersUseCase;
  private listWorkerServicesUseCase: ListWorkerServicesUseCase;

  constructor() {
    this.reapplyWorkerUseCase = new ReapplyWorkerUseCase(userRepository);
    this.listPublicWorkersUseCase = new ListPublicWorkersUseCase(workerRepository);
    this.listWorkerServicesUseCase = new ListWorkerServicesUseCase(workerRepository);
  }

  /**
   * Lister les workers publics
   * GET /api/workers/public
   * 
   * Query params:
   * - professionId (optionnel): Filtrer par profession
   * - page: Numéro de page (via middleware pagination)
   * - pageSize: Taille de page (via middleware pagination)
   */
  async listPublicWorkers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // Récupérer les paramètres de pagination depuis le middleware
      const pagination = req.pagination;
      const professionId = req.query.professionId as string | undefined;

      // Appel au use case
      const result = await this.listPublicWorkersUseCase.execute({
        professionId: professionId || undefined,
        skip: pagination?.skip ?? 0,
        take: pagination?.take ?? 10,
      });

      // Générer les métadonnées de pagination
      const paginationMeta = getPaginationMetadata(
        pagination?.page ?? 1,
        pagination?.pageSize ?? 10,
        result.total
      );

      return sendSuccess(res, 'Workers publics récupérés avec succès.', {
        workers: result.workers,
        pagination: paginationMeta,
      });
    } catch (error) {
      return next(error);
    }
  }

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
  async listWorkerServices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const workerIdParam = req.params.workerId;
      
      // Validate workerId
      if (!workerIdParam || typeof workerIdParam !== 'string') {
        return sendError(res, 'ID du worker invalide.', 400);
      }

      // Récupérer les paramètres de pagination depuis le middleware
      const pagination = req.pagination;

      // Appel au use case
      const result = await this.listWorkerServicesUseCase.execute({
        workerId: workerIdParam,
        skip: pagination?.skip ?? 0,
        take: pagination?.take ?? 10,
      });

      // Générer les métadonnées de pagination
      const paginationMeta = getPaginationMetadata(
        pagination?.page ?? 1,
        pagination?.pageSize ?? 10,
        result.total
      );

      return sendSuccess(res, 'Services du worker récupérés avec succès.', {
        services: result.services,
        pagination: paginationMeta,
      });
    } catch (error) {
      // Gérer les erreurs métier spécifiques
      if (error instanceof WorkerNotApprovedError) {
        return sendNotFound(res, error.message);
      }
      return next(error);
    }
  }

  /**
   * Refaire une demande de validation
   * PATCH /api/workers/me/reapply
   */
  async reapply(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // L'ID du worker vient du middleware d'authentification (req.user)
      const workerId = req.user?.sub;

      if (!workerId) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié.',
        });
      }

      // Appeler le use case
      const result = await this.reapplyWorkerUseCase.execute({
        workerId,
      });

      // Formater la réponse
      return sendSuccess(res, result.message, {
        worker: result.user.toResponse(),
      });
    } catch (error) {
      return next(error);
    }
  }
}

// Export d'une instance singleton
export const workerController = new WorkerController();
