// ============================================================================
// DASHBOARD CONTROLLER - Interface Layer
// ============================================================================
// Controller pour les endpoints du dashboard admin
// ============================================================================

import type { Request, Response } from 'express';
import { GetAdminDashboardUseCase, GetWorkerDashboardUseCase, GetClientDashboardUseCase, type GetAdminDashboardInput } from '../application/index.js';
import { HTTP_STATUS } from '../../../shared/constants/messages.js';
import { BusinessError } from '../../../shared/errors/index.js';

/**
 * Controller pour le dashboard admin
 */
export class DashboardController {
  constructor(
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
    private readonly getWorkerDashboardUseCase: GetWorkerDashboardUseCase,
    private readonly getClientDashboardUseCase: GetClientDashboardUseCase
  ) {}

  /**
   * GET /api/dashboard/admin
   * Récupère les statistiques du dashboard admin
   * 
   * @queryParam period - Période prédéfinie (7d, 30d, 90d, 1y)
   * @queryParam startDate - Date de début (YYYY-MM-DD)
   * @queryParam endDate - Date de fin (YYYY-MM-DD)
   */
  async getAdminDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { period, startDate, endDate } = req.query;

      // Valider les paramètres d'entrée
      const input: GetAdminDashboardInput = {};
      
      if (period) {
        if (!['7d', '30d', '90d', '1y'].includes(period as string)) {
          throw new BusinessError({
            message: 'Période invalide. Les valeurs possibles sont: 7d, 30d, 90d, 1y',
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: 'INVALID_PERIOD',
          });
        }
        input.period = period as '7d' | '30d' | '90d' | '1y';
      }

      if (startDate) {
        if (!this.isValidDate(startDate as string)) {
          throw new BusinessError({
            message: 'Date de début invalide. Format attendu: YYYY-MM-DD',
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: 'INVALID_START_DATE',
          });
        }
        input.startDate = startDate as string;
      }

      if (endDate) {
        if (!this.isValidDate(endDate as string)) {
          throw new BusinessError({
            message: 'Date de fin invalide. Format attendu: YYYY-MM-DD',
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: 'INVALID_END_DATE',
          });
        }
        input.endDate = endDate as string;
      }

      // Si les deux dates sont fournies, vérifier leur ordre
      if (input.startDate && input.endDate) {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        
        if (start > end) {
          throw new BusinessError({
            message: 'La date de début doit être antérieure à la date de fin',
            statusCode: HTTP_STATUS.BAD_REQUEST,
            code: 'INVALID_DATE_RANGE',
          });
        }
      }

      // Exécuter le use case
      const dashboard = await this.getAdminDashboardUseCase.execute(input);

      // Retourner la réponse
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        });
        return;
      }

      // Erreur interne
      console.error('Dashboard error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erreur lors de la récupération du dashboard',
          code: 'DASHBOARD_ERROR',
        },
      });
    }
  }

  /**
   * GET /api/dashboard/worker
   * Récupère les statistiques du dashboard worker
   * Le workerId est récupéré depuis req.user.id
   */
  async getWorkerDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer le workerId depuis req.user (injecté par le middleware authenticate)
      const workerId = req.user?.sub;

      if (!workerId) {
        throw new BusinessError({
          message: 'Worker ID non trouvé dans le token',
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        });
      }

      // Exécuter le use case
      const dashboard = await this.getWorkerDashboardUseCase.execute({ workerId });

      // Retourner la réponse
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        });
        return;
      }

      // Erreur interne
      console.error('Worker Dashboard error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erreur lors de la récupération du dashboard worker',
          code: 'WORKER_DASHBOARD_ERROR',
        },
      });
    }
  }

  /**
   * GET /api/dashboard/client
   * Récupère les statistiques du dashboard client
   * Le clientId est récupéré exclusivement depuis req.user.sub (JWT token)
   * Aucune donnée n'est acceptée depuis query ou params pour des raisons de sécurité
   */
  async getClientDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer le clientId depuis req.user (injecté par le middleware authenticate)
      // C'est le seul moyen sécurisé d'obtenir l'ID du client
      const clientId = req.user?.sub;

      if (!clientId) {
        throw new BusinessError({
          message: 'Client ID non trouvé dans le token',
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        });
      }

      // Exécuter le use case
      const dashboard = await this.getClientDashboardUseCase.execute({ clientId });

      // Retourner la réponse
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        });
        return;
      }

      // Erreur interne
      console.error('Client Dashboard error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erreur lors de la récupération du dashboard client',
          code: 'CLIENT_DASHBOARD_ERROR',
        },
      });
    }
  }

  /**
   * Valide le format d'une date (YYYY-MM-DD)
   */
  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
