// ============================================================================
// UTILITAIRES DE RÉPONSE API
// ============================================================================
// Helpers pour formater les réponses de l'API de manière standardisée.
// Tous les réponses suivent le format:
//   - Succès: { success: true, message: string, data?: any }
//   - Erreur: { success: false, message: string, errors?: any }
// ============================================================================
import { HTTP_STATUS } from '../constants/messages.js';
/**
 * Async handler wrapper to catch errors and pass them to Express error handling
 * This prevents unhandled promise rejections from hanging requests
 *
 * @param fn - The async route handler function
 * @returns A function that wraps the handler with try/catch
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * Helper pour envoyer une réponse de succès
 * @param res - Objet Response Express
 * @param message - Message de succès en français
 * @param data - Données à retourner (optionnel)
 * @param statusCode - Code HTTP (défaut: 200)
 */
export const sendSuccess = (res, message, data, statusCode = HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data !== undefined && { data }),
    });
};
/**
 * Helper pour envoyer une réponse de création (201)
 */
export const sendCreated = (res, message, data) => {
    return sendSuccess(res, message, data, HTTP_STATUS.CREATED);
};
/**
 * Helper pour envoyer une réponse d'erreur
 * @param res - Objet Response Express
 * @param message - Message d'erreur en français
 * @param statusCode - Code HTTP (défaut: 400)
 * @param errors - Erreurs détaillées (optionnel)
 * @param code - Code d'erreur personnalisé (optionnel)
 */
export const sendError = (res, message, statusCode = HTTP_STATUS.BAD_REQUEST, errors, code) => {
    const response = {
        success: false,
        message,
    };
    if (errors) {
        response.errors = errors;
    }
    if (code) {
        response.code = code;
    }
    return res.status(statusCode).json(response);
};
/**
 * Helper pour envoyer une réponse 401 Unauthorized
 */
export const sendUnauthorized = (res, message = 'Accès non autorisé.') => {
    return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
};
/**
 * Helper pour envoyer une réponse 403 Forbidden
 */
export const sendForbidden = (res, message = 'Accès refusé.') => {
    return sendError(res, message, HTTP_STATUS.FORBIDDEN);
};
/**
 * Helper pour envoyer une réponse 404 Not Found
 */
export const sendNotFound = (res, message = 'Ressource introuvable.') => {
    return sendError(res, message, HTTP_STATUS.NOT_FOUND);
};
/**
 * Helper pour envoyer une réponse 409 Conflict
 */
export const sendConflict = (res, message, errors) => {
    return sendError(res, message, HTTP_STATUS.CONFLICT, errors);
};
/**
 * Helper pour envoyer une réponse 500 Internal Server Error
 */
export const sendServerError = (res, message = 'Une erreur interne s\'est produite.') => {
    return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
//# sourceMappingURL=api-response.js.map