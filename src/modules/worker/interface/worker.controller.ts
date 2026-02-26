// ============================================================================
// INTERFACE LAYER - Worker Controller
// ============================================================================
// Gère les requêtes HTTP pour les opérations du travailleur
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import { ReapplyWorkerUseCase } from '../application/index.js';
import { userRepository } from '../../user/infrastructure/index.js';
import { sendSuccess } from '../../../shared/utils/index.js';

/**
 * Worker Controller
 * 
 * RESPONSABILITÉS:
 * - Gérer les requêtes HTTP
 * - Valider les entrées
 * - Appeler les use cases
 * - Formater les réponses HTTP
 */
export class WorkerController {
  private reapplyWorkerUseCase: ReapplyWorkerUseCase;

  constructor() {
    this.reapplyWorkerUseCase = new ReapplyWorkerUseCase(userRepository);
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
