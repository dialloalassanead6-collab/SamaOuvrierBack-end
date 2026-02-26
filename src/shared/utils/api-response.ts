// ============================================================================
// UTILITAIRES DE RÉPONSE API
// ============================================================================
// Helpers pour formater les réponses de l'API de manière standardisée.
// Tous les réponses suivent le format:
//   - Succès: { success: true, message: string, data?: any }
//   - Erreur: { success: false, message: string, errors?: any }
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/messages.js';

/**
 * Async handler wrapper to catch errors and pass them to Express error handling
 * This prevents unhandled promise rejections from hanging requests
 * 
 * @param fn - The async route handler function
 * @returns A function that wraps the handler with try/catch
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Format de réponse API standard
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
}

/**
 * Format de réponse d'erreur
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, unknown>;
  code?: string;
}

/**
 * Format de réponse de succès
 */
export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

/**
 * Helper pour envoyer une réponse de succès
 * @param res - Objet Response Express
 * @param message - Message de succès en français
 * @param data - Données à retourner (optionnel)
 * @param statusCode - Code HTTP (défaut: 200)
 */
export const sendSuccess = <T = unknown>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = HTTP_STATUS.OK
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};

/**
 * Helper pour envoyer une réponse de création (201)
 */
export const sendCreated = <T = unknown>(
  res: Response,
  message: string,
  data?: T
): Response<ApiResponse<T>> => {
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
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  errors?: Record<string, unknown>,
  code?: string
): Response<ApiError> => {
  const response: ApiError = {
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
export const sendUnauthorized = (
  res: Response,
  message: string = 'Accès non autorisé.'
): Response<ApiError> => {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Helper pour envoyer une réponse 403 Forbidden
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Accès refusé.'
): Response<ApiError> => {
  return sendError(res, message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Helper pour envoyer une réponse 404 Not Found
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Ressource introuvable.'
): Response<ApiError> => {
  return sendError(res, message, HTTP_STATUS.NOT_FOUND);
};

/**
 * Helper pour envoyer une réponse 409 Conflict
 */
export const sendConflict = (
  res: Response,
  message: string,
  errors?: Record<string, unknown>
): Response<ApiError> => {
  return sendError(res, message, HTTP_STATUS.CONFLICT, errors);
};

/**
 * Helper pour envoyer une réponse 500 Internal Server Error
 */
export const sendServerError = (
  res: Response,
  message: string = 'Une erreur interne s\'est produite.'
): Response<ApiError> => {
  return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
