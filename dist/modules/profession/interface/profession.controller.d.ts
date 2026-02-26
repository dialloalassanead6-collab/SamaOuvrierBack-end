import type { Request, Response, NextFunction } from 'express';
/**
 * Profession Controller
 *
 * Using arrow functions to avoid binding issues
 */
export declare const professionController: {
    /**
     * Create a new profession
     * POST /professions
     * ADMIN only
     */
    create: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Get all professions
     * GET /professions
     * Public with pagination
     */
    list: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Update a profession
     * PATCH /professions/:id
     * ADMIN only
     */
    update: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Delete a profession
     * DELETE /professions/:id
     * ADMIN only
     */
    delete: (req: Request, res: Response, next: NextFunction) => void;
};
//# sourceMappingURL=profession.controller.d.ts.map