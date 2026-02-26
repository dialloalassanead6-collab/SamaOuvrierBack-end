// Interface Layer - Profession Controller
// Handles HTTP requests and responses
import { CreateProfessionUseCase, UpdateProfessionUseCase, DeleteProfessionUseCase, ListProfessionsUseCase, } from '../application/index.js';
import { professionRepository } from '../infrastructure/index.js';
import { asyncHandler, sendSuccess, sendCreated, sendError, sendNotFound, sendConflict } from '../../../shared/utils/index.js';
/**
 * Profession Controller
 *
 * Using arrow functions to avoid binding issues
 */
export const professionController = {
    /**
     * Create a new profession
     * POST /professions
     * ADMIN only
     */
    create: asyncHandler(async (req, res, _next) => {
        const { name, description } = req.body;
        // Validation simple
        if (!name || name.trim().length < 2) {
            return sendError(res, 'Le nom est requis et doit contenir au moins 2 caractères.', 400);
        }
        const createProfessionUseCase = new CreateProfessionUseCase(professionRepository);
        const profession = await createProfessionUseCase.execute({
            name: name.trim(),
            description: description?.trim(),
        });
        return sendCreated(res, 'Profession créée avec succès.', profession);
    }),
    /**
     * Get all professions
     * GET /professions
     * Public
     */
    list: asyncHandler(async (_req, res, _next) => {
        const listProfessionsUseCase = new ListProfessionsUseCase(professionRepository);
        const professions = await listProfessionsUseCase.execute();
        return sendSuccess(res, 'Professions récupérées avec succès.', professions);
    }),
    /**
     * Update a profession
     * PATCH /professions/:id
     * ADMIN only
     */
    update: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const { name, description } = req.body;
        // Validation simple
        if (name !== undefined && name.trim().length < 2) {
            return sendError(res, 'Le nom doit contenir au moins 2 caractères.', 400);
        }
        const updateProfessionUseCase = new UpdateProfessionUseCase(professionRepository);
        try {
            const profession = await updateProfessionUseCase.execute(id, {
                name: name?.trim(),
                description: description?.trim(),
            });
            return sendSuccess(res, 'Profession mise à jour avec succès.', profession);
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Profession introuvable.');
            }
            if (err.statusCode === 409) {
                return sendConflict(res, 'Une profession avec ce nom existe déjà.');
            }
            throw error;
        }
    }),
    /**
     * Delete a profession
     * DELETE /professions/:id
     * ADMIN only
     */
    delete: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const deleteProfessionUseCase = new DeleteProfessionUseCase(professionRepository);
        try {
            await deleteProfessionUseCase.execute(id);
            return sendSuccess(res, 'Profession supprimée avec succès.');
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Profession introuvable.');
            }
            throw error;
        }
    }),
};
//# sourceMappingURL=profession.controller.js.map