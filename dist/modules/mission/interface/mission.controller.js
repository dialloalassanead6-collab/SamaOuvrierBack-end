// ============================================================================
// MISSION CONTROLLER - INTERFACE LAYER
// ============================================================================
// Gère les requêtes HTTP et les réponses
// ============================================================================
import { CreateMissionUseCase, ConfirmInitialPaymentUseCase, AcceptMissionUseCase, RefuseMissionUseCase, SetFinalPriceUseCase, ConfirmFinalPaymentUseCase, CompleteMissionUseCase, CancelMissionUseCase, GetMissionsUseCase, RequestCancellationUseCase, ProcessCancellationUseCase, } from '../application/index.js';
import { missionRepository } from '../infrastructure/index.js';
import { serviceRepository } from '../../service/infrastructure/index.js';
import { notificationService } from '../../notification/index.js';
import { asyncHandler, sendSuccess, sendCreated, sendError, sendNotFound } from '../../../shared/utils/index.js';
import { getPaginationMetadata } from '../../../shared/middleware/pagination.middleware.js';
/**
 * Mission Controller
 *
 * Utilise les fonctions fléchées pour éviter les problèmes de binding
 */
export const missionController = {
    /**
     * Crée une nouvelle mission
     * POST /missions
     *
     * @requires Authentication (CLIENT only)
     */
    create: asyncHandler(async (req, res, _next) => {
        const { workerId, serviceId } = req.body;
        const authenticatedUserId = req.user?.sub;
        const userRole = req.user?.role;
        // Validation des champs requis
        if (!authenticatedUserId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        // Validation du rôle - seul un CLIENT peut créer une mission
        if (userRole !== 'CLIENT') {
            return sendError(res, 'Seuls les clients peuvent créer des missions.', 403);
        }
        if (!workerId || !serviceId) {
            return sendError(res, 'Les IDs worker et service sont requis.', 400);
        }
        // Le clientId sera récupéré de l'utilisateur authentifié dans le use case
        const createMissionUseCase = new CreateMissionUseCase(missionRepository, serviceRepository);
        const mission = await createMissionUseCase.execute({ workerId, serviceId }, authenticatedUserId);
        return sendCreated(res, 'Mission créée avec succès. En attente du paiement initial.', mission);
    }),
    /**
     * Liste les missions avec pagination
     * GET /missions
     *
     * Filtrage basé sur le rôle de l'utilisateur:
     * - CLIENT → voit uniquement ses missions (clientId = user.id)
     * - WORKER → voit uniquement ses missions (workerId = user.id)
     * - ADMIN → voit toutes les missions
     */
    list: asyncHandler(async (req, res, _next) => {
        const { page, pageSize, skip, take } = req.pagination;
        const { details } = req.query;
        // Récupérer le rôle et l'ID de l'utilisateur connecté
        const userId = req.user?.sub;
        const userRole = req.user?.role;
        // Filtrer selon le rôle
        let clientId;
        let workerId;
        if (userRole === 'CLIENT' && userId) {
            // CLIENT voit uniquement ses missions
            clientId = userId;
        }
        else if (userRole === 'WORKER' && userId) {
            // WORKER voit uniquement ses missions
            workerId = userId;
        }
        else if (userRole === 'ADMIN') {
            // ADMIN voit toutes les missions (peut utiliser les params de requête)
            clientId = req.query.clientId;
            workerId = req.query.workerId;
        }
        const getMissionsUseCase = new GetMissionsUseCase(missionRepository);
        const withDetails = details === 'true';
        const result = await getMissionsUseCase.execute(skip, take, clientId, workerId, withDetails);
        const pagination = getPaginationMetadata(page, pageSize, result.total);
        return sendSuccess(res, 'Missions récupérées avec succès.', {
            data: result.missions,
            pagination,
        });
    }),
    /**
     * Récupère une mission par ID
     * GET /missions/:id
     *
     * @requires Authentication + ownership check
     */
    getById: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const getMissionsUseCase = new GetMissionsUseCase(missionRepository);
        const mission = await getMissionsUseCase.getById(id);
        if (!mission) {
            return sendNotFound(res, 'Mission introuvable.');
        }
        return sendSuccess(res, 'Mission récupérée avec succès.', mission);
    }),
    /**
     * Confirme le paiement initial
     * POST /missions/:id/confirm-initial-payment
     *
     * @requires Authentication
     * Note: Cette endpoint est appelée par le webhook du système de paiement externe
     */
    confirmInitialPayment: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        const confirmInitialPaymentUseCase = new ConfirmInitialPaymentUseCase(missionRepository);
        try {
            await confirmInitialPaymentUseCase.execute(id, userId);
            return sendSuccess(res, 'Paiement initial confirmé. Contact déverrouillé.');
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400) {
                return sendError(res, err.message, 400);
            }
            if (err.statusCode === 403) {
                return sendError(res, err.message, 403);
            }
            throw error;
        }
    }),
    /**
     * Le worker accepte la mission
     * POST /missions/:id/accept
     *
     * @requires Authentication (WORKER only)
     */
    accept: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        const acceptMissionUseCase = new AcceptMissionUseCase(missionRepository, notificationService);
        try {
            const result = await acceptMissionUseCase.execute(id, userId);
            return sendSuccess(res, 'Mission acceptée. Le contact est désormais débloqué.', result.mission);
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400) {
                return sendError(res, err.message, 400);
            }
            if (err.statusCode === 403) {
                return sendError(res, err.message, 403);
            }
            throw error;
        }
    }),
    /**
     * Le worker refuse la mission
     * POST /missions/:id/refuse
     *
     * @requires Authentication (WORKER only)
     */
    refuse: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        const refuseMissionUseCase = new RefuseMissionUseCase(missionRepository, notificationService);
        try {
            const result = await refuseMissionUseCase.execute(id, userId);
            return sendSuccess(res, 'Mission refusée. Le client sera notifié pour remboursement.', result.mission);
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400) {
                return sendError(res, err.message, 400);
            }
            if (err.statusCode === 403) {
                return sendError(res, err.message, 403);
            }
            throw error;
        }
    }),
    /**
     * Fixe le prix final après négociation
     * POST /missions/:id/set-final-price
     *
     * @requires Authentication
     */
    setFinalPrice: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const { prixFinal } = req.body;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        if (typeof prixFinal !== 'number') {
            return sendError(res, 'Le prix final est requis et doit être un nombre.', 400);
        }
        const setFinalPriceUseCase = new SetFinalPriceUseCase(missionRepository);
        try {
            const mission = await setFinalPriceUseCase.execute(id, { userId, prixFinal });
            return sendSuccess(res, 'Prix final fixé avec succès.', mission);
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400) {
                return sendError(res, err.message, 400);
            }
            if (err.statusCode === 403) {
                return sendError(res, err.message, 403);
            }
            throw error;
        }
    }),
    /**
     * Confirme le paiement final
     * POST /missions/:id/confirm-final-payment
     *
     * @requires Authentication
     * Note: Cette endpoint est appelée par le webhook du système de paiement externe
     */
    confirmFinalPayment: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        const confirmFinalPaymentUseCase = new ConfirmFinalPaymentUseCase(missionRepository);
        try {
            await confirmFinalPaymentUseCase.execute(id, userId);
            return sendSuccess(res, 'Paiement final confirmé. Mission en cours.');
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400) {
                return sendError(res, err.message, 400);
            }
            if (err.statusCode === 403) {
                return sendError(res, err.message, 403);
            }
            throw error;
        }
    }),
    /**
     * Marque la mission comme terminée (double confirmation)
     * POST /missions/:id/complete
     *
     * @requires Authentication
     */
    complete: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const userId = req.user?.sub;
        const userRole = req.user?.role;
        if (!userId || !userRole) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        const completeMissionUseCase = new CompleteMissionUseCase(missionRepository, notificationService);
        try {
            const result = await completeMissionUseCase.execute(id, { userId, userRole });
            if (!result) {
                return sendError(res, 'Erreur lors de la confirmation de la mission.', 500);
            }
            if (result.event) {
                return sendSuccess(res, 'Mission terminée et confirmée par les deux parties.', result.mission);
            }
            return sendSuccess(res, 'Confirmation enregistrée. En attente de confirmation de l\'autre partie.', result.mission);
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400) {
                return sendError(res, err.message, 400);
            }
            if (err.statusCode === 403) {
                return sendError(res, err.message, 403);
            }
            throw error;
        }
    }),
    /**
     * Demande l'annulation d'une mission en cours
     * POST /missions/:id/request-cancellation
     *
     * @requires Authentication
     */
    requestCancellation: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        const requestCancellationUseCase = new RequestCancellationUseCase(missionRepository);
        try {
            // Utiliser la mission déjà récupérée par le middleware verifyMissionOwnership
            // pour éviter une double requête en base de données
            const mission = req.body.mission;
            if (!mission) {
                return sendError(res, 'Erreur interne: mission non trouvée.', 500);
            }
            let cancellationRequester;
            if (mission.clientId === userId) {
                cancellationRequester = 'CLIENT';
            }
            else if (mission.workerId === userId) {
                cancellationRequester = 'WORKER';
            }
            else {
                return sendError(res, 'Vous n\'êtes pas autorisé à demander l\'annulation de cette mission.', 403);
            }
            const updatedMission = await requestCancellationUseCase.execute(id, { requester: cancellationRequester });
            return sendSuccess(res, 'Demande d\'annulation soumise. En attente de validation.', updatedMission);
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400 || err.statusCode === 403) {
                return sendError(res, err.message, err.statusCode);
            }
            throw error;
        }
    }),
    /**
     * Traite une demande d'annulation (approuve ou rejette)
     * POST /missions/:id/process-cancellation
     *
     * @requires Authentication
     */
    processCancellation: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const { approved } = req.body;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        if (typeof approved !== 'boolean') {
            return sendError(res, 'Le paramètre approved est requis et doit être un booléen.', 400);
        }
        const processCancellationUseCase = new ProcessCancellationUseCase(missionRepository);
        try {
            const mission = await processCancellationUseCase.execute(id, { approved }, userId);
            if (approved) {
                return sendSuccess(res, 'Annulation approuvée. La mission a été annulée.', mission);
            }
            else {
                return sendSuccess(res, 'Annulation rejetée. La mission reprend son cours.', mission);
            }
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400 || err.statusCode === 403) {
                return sendError(res, err.message, err.statusCode);
            }
            throw error;
        }
    }),
    /**
     * Annule une mission (pour les statuts permettant une annulation directe)
     * POST /missions/:id/cancel
     *
     * @requires Authentication
     */
    cancel: asyncHandler(async (req, res, _next) => {
        const { id } = req.params;
        const userId = req.user?.sub;
        if (!userId) {
            return sendError(res, 'Vous devez être authentifié.', 401);
        }
        const cancelMissionUseCase = new CancelMissionUseCase(missionRepository, notificationService);
        try {
            await cancelMissionUseCase.execute(id, userId);
            return sendSuccess(res, 'Mission annulée avec succès.');
        }
        catch (error) {
            const err = error;
            if (err.statusCode === 404) {
                return sendNotFound(res, 'Mission introuvable.');
            }
            if (err.statusCode === 400) {
                return sendError(res, err.message, 400);
            }
            if (err.statusCode === 403) {
                return sendError(res, err.message, 403);
            }
            throw error;
        }
    }),
};
//# sourceMappingURL=mission.controller.js.map