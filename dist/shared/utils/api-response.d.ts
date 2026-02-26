import type { Request, Response, NextFunction } from 'express';
/**
 * Async handler wrapper to catch errors and pass them to Express error handling
 * This prevents unhandled promise rejections from hanging requests
 *
 * @param fn - The async route handler function
 * @returns A function that wraps the handler with try/catch
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>) => (req: Request, res: Response, next: NextFunction) => void;
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
export declare const sendSuccess: <T = unknown>(res: Response, message: string, data?: T, statusCode?: number) => Response<ApiResponse<T>>;
/**
 * Helper pour envoyer une réponse de création (201)
 */
export declare const sendCreated: <T = unknown>(res: Response, message: string, data?: T) => Response<ApiResponse<T>>;
/**
 * Helper pour envoyer une réponse d'erreur
 * @param res - Objet Response Express
 * @param message - Message d'erreur en français
 * @param statusCode - Code HTTP (défaut: 400)
 * @param errors - Erreurs détaillées (optionnel)
 * @param code - Code d'erreur personnalisé (optionnel)
 */
export declare const sendError: (res: Response, message: string, statusCode?: number, errors?: Record<string, unknown>, code?: string) => Response<ApiError>;
/**
 * Helper pour envoyer une réponse 401 Unauthorized
 */
export declare const sendUnauthorized: (res: Response, message?: string) => Response<ApiError>;
/**
 * Helper pour envoyer une réponse 403 Forbidden
 */
export declare const sendForbidden: (res: Response, message?: string) => Response<ApiError>;
/**
 * Helper pour envoyer une réponse 404 Not Found
 */
export declare const sendNotFound: (res: Response, message?: string) => Response<ApiError>;
/**
 * Helper pour envoyer une réponse 409 Conflict
 */
export declare const sendConflict: (res: Response, message: string, errors?: Record<string, unknown>) => Response<ApiError>;
/**
 * Helper pour envoyer une réponse 500 Internal Server Error
 */
export declare const sendServerError: (res: Response, message?: string) => Response<ApiError>;
//# sourceMappingURL=api-response.d.ts.map