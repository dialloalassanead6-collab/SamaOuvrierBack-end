import type { Request, Response } from 'express';
import type { IDisputeRepository } from '../application/dispute.repository.interface.js';
export declare class DisputeController {
    private createDisputeUseCase;
    private getDisputesUseCase;
    private resolveDisputeUseCase;
    private addEvidenceUseCase;
    constructor(disputeRepository: IDisputeRepository);
    /**
     * POST /disputes - Create a new dispute
     */
    createDispute(req: Request, res: Response): Promise<void>;
    /**
     * GET /disputes - Get disputes with filters
     */
    getDisputes(req: Request, res: Response): Promise<void>;
    /**
     * GET /disputes/my - Get current user's disputes
     */
    getMyDisputes(req: Request, res: Response): Promise<void>;
    /**
     * GET /disputes/:id - Get dispute by ID
     */
    getDisputeById(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /disputes/:id/resolve - Resolve a dispute (admin only)
     */
    resolveDispute(req: Request, res: Response): Promise<void>;
    /**
     * PATCH /disputes/:id/review - Put dispute under review (admin only)
     */
    reviewDispute(req: Request, res: Response): Promise<void>;
    /**
     * POST /disputes/:id/evidence - Add evidence to a dispute
     */
    addEvidence(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /disputes/:id/evidences/:evidenceId - Delete evidence
     */
    deleteEvidence(req: Request, res: Response): Promise<void>;
    /**
     * Get multer upload middleware
     */
    getUploadMiddleware(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
}
//# sourceMappingURL=dispute.controller.d.ts.map