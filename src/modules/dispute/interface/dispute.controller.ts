// ============================================================================
// DISPUTE CONTROLLER - Interface Layer
// ============================================================================
// Handles HTTP requests for dispute endpoints
// With hardened security
// ============================================================================

import type { Request, Response } from 'express';
import multer from 'multer';
import type { IDisputeRepository } from '../application/dispute.repository.interface.js';
import {
  CreateDisputeUseCase,
  GetDisputesUseCase,
  ResolveDisputeUseCase,
  AddEvidenceUseCase,
} from '../application/use-cases/index.js';
import { DisputeDomainError } from '../domain/index.js';
import { cloudinaryService } from '../infrastructure/cloudinary/cloudinary.service.js';
import { notificationService } from '../../notification/index.js';
import {
  createDisputeSchema,
  getDisputesQuerySchema,
  resolveDisputeSchema,
  addEvidenceSchema,
} from './dispute.validation.js';
import { DisputeStatus } from '@prisma/client';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max at transport level
  },
});

export class DisputeController {
  private createDisputeUseCase: CreateDisputeUseCase;
  private getDisputesUseCase: GetDisputesUseCase;
  private resolveDisputeUseCase: ResolveDisputeUseCase;
  private addEvidenceUseCase: AddEvidenceUseCase;

  constructor(disputeRepository: IDisputeRepository) {
    this.createDisputeUseCase = new CreateDisputeUseCase(disputeRepository, notificationService);
    this.getDisputesUseCase = new GetDisputesUseCase(disputeRepository);
    this.resolveDisputeUseCase = new ResolveDisputeUseCase(disputeRepository, notificationService);
    this.addEvidenceUseCase = new AddEvidenceUseCase(disputeRepository);
  }

  /**
   * POST /disputes - Create a new dispute
   */
  async createDispute(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
        return;
      }

      const validatedInput = createDisputeSchema.parse(req.body);

      const result = await this.createDisputeUseCase.execute({
        ...validatedInput,
        reporterId: userId,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof DisputeDomainError) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * GET /disputes - Get disputes with filters
   */
  async getDisputes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
        return;
      }

      const validatedQuery = getDisputesQuerySchema.parse(req.query);
      
      // Non-admin users can only see their own disputes
      const userRole = req.user?.role;
      
      const filters: Record<string, string> = {};
      if (userRole !== 'ADMIN') {
        filters.reporterId = userId!;
      } else if (validatedQuery.reporterId) {
        filters.reporterId = validatedQuery.reporterId;
      }
      
      if (validatedQuery.status) filters.status = validatedQuery.status;
      if (validatedQuery.missionId) filters.missionId = validatedQuery.missionId;
      if (validatedQuery.reportedUserId) filters.reportedUserId = validatedQuery.reportedUserId;

      const result = await this.getDisputesUseCase.execute({
        filters,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * GET /disputes/my - Get current user's disputes
   */
  async getMyDisputes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.getDisputesUseCase.execute({
        filters: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reporterId: userId as any,
        },
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * GET /disputes/:id - Get dispute by ID
   */
  async getDisputeById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const userRole = req.user?.role;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
        return;
      }

      const { id } = req.params;

      // Find the dispute
      const disputeRepo = (this.createDisputeUseCase as any).disputeRepository;
      const dispute = await disputeRepo.findById(id);

      if (!dispute) {
        res.status(404).json({
          success: false,
          message: 'Dispute introuvable',
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyDispute = dispute as any;

      // Check access - only admin, reporter, or reported user can view
      if (
        userRole !== 'ADMIN' &&
        anyDispute.reporter_id !== userId &&
        anyDispute.reported_user_id !== userId
      ) {
        res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à voir cette dispute',
        });
        return;
      }

      // Get events for audit trail
      const events = await disputeRepo.getEvents(id);

      res.status(200).json({
        success: true,
        data: {
          ...anyDispute,
          events,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * PATCH /disputes/:id/resolve - Resolve a dispute (admin only)
   */
  async resolveDispute(req: Request, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Accès refusé. Réservé aux administrateurs.',
        });
        return;
      }

      const validatedInput = resolveDisputeSchema.parse({
        ...req.params,
        ...req.body,
      });

      const result = await this.resolveDisputeUseCase.execute({
        disputeId: validatedInput.disputeId,
        resolution: validatedInput.resolution,
        resolutionNote: validatedInput.resolutionNote ?? null,
        resolvedBy: req.user.sub,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof DisputeDomainError) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * PATCH /disputes/:id/review - Put dispute under review (admin only)
   */
  async reviewDispute(req: Request, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Accès refusé. Réservé aux administrateurs.',
        });
        return;
      }

      const { id } = req.params;

      // Find the dispute
      const disputeRepo = (this.createDisputeUseCase as any).disputeRepository;
      const dispute = await disputeRepo.findById(id);

      if (!dispute) {
        res.status(404).json({
          success: false,
          message: 'Dispute introuvable',
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyDispute = dispute as any;

      // Check dispute can be reviewed
      if (anyDispute.status !== 'OPEN') {
        res.status(400).json({
          success: false,
          message: `La dispute ne peut pas être mise en examen dans son état actuel: ${anyDispute.status}`,
        });
        return;
      }

      // Update status to UNDER_REVIEW
      const updatedDispute = await disputeRepo.update(id, {
        status: DisputeStatus.UNDER_REVIEW,
      });

      // Create audit event
      await disputeRepo.createEvent(id, {
        type: 'STATUS_CHANGED',
        performedBy: req.user.sub,
        metadata: {
          previousStatus: 'OPEN',
          newStatus: 'UNDER_REVIEW',
        },
      });

      res.status(200).json({
        success: true,
        data: updatedDispute,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * POST /disputes/:id/evidence - Add evidence to a dispute
   */
  async addEvidence(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
        return;
      }

      const validatedParams = addEvidenceSchema.parse(req.params);
      
      // Handle file upload
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
        return;
      }

      const result = await this.addEvidenceUseCase.execute({
        disputeId: validatedParams.disputeId,
        uploadedBy: userId,
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        description: req.body.description,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof DisputeDomainError) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * DELETE /disputes/:id/evidences/:evidenceId - Delete evidence
   */
  async deleteEvidence(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const userRole = req.user?.role;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié',
        });
        return;
      }

      const { id: disputeId, evidenceId } = req.params;

      // Find the dispute
      const disputeRepo = (this.createDisputeUseCase as any).disputeRepository;
      const dispute = await disputeRepo.findById(disputeId);

      if (!dispute) {
        res.status(404).json({
          success: false,
          message: 'Dispute introuvable',
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyDispute = dispute as any;

      // Check access
      if (
        userRole !== 'ADMIN' &&
        anyDispute.reporter_id !== userId &&
        anyDispute.reported_user_id !== userId
      ) {
        res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à supprimer des preuves de cette dispute',
        });
        return;
      }

      // Check dispute is not closed or resolved
      if (anyDispute.status === 'RESOLVED' || anyDispute.status === 'CLOSED') {
        res.status(400).json({
          success: false,
          message: 'Impossible de supprimer des preuves d\'une dispute résolue ou fermée',
        });
        return;
      }

      // Find the evidence
      const evidence = await disputeRepo.findEvidenceById(evidenceId);

      if (!evidence) {
        res.status(404).json({
          success: false,
          message: 'Preuve introuvable',
        });
        return;
      }

      // Check evidence belongs to this dispute
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((evidence as any).dispute_id !== disputeId) {
        res.status(403).json({
          success: false,
          message: 'Cette preuve n\'appartient pas à cette dispute',
        });
        return;
      }

      // Delete from Cloudinary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await cloudinaryService.deleteEvidence((evidence as any).public_id);

      // Delete from database
      await disputeRepo.deleteEvidence(evidenceId);

      // Create audit event
      await disputeRepo.createEvent(disputeId, {
        type: 'EVIDENCE_DELETED',
        performedBy: userId,
        metadata: {
          evidenceId,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Preuve supprimée avec succès',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
      });
    }
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware() {
    return upload.single('file');
  }
}
