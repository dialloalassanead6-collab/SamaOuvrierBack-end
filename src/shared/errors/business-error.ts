// ============================================================================
// CLASSE D'ERREUR MÉTIER (BUSINESS ERROR)
// ============================================================================
// Cette classe permet de gérer les erreurs métier de manière cohérente.
// Elle intègre:
// - Un message en français
// - Un code HTTP
// - Un code d'erreur personnalisé
// - La possibilité d'ajouter des erreurs détaillées
// ============================================================================

import { HTTP_STATUS, ERROR_CODES } from '../constants/messages.js';

/**
 * Propriétés d'une erreur métier
 */
export interface BusinessErrorOptions {
  /** Message d'erreur en français */
  message: string;
  /** Code HTTP à retourner */
  statusCode?: number;
  /** Code d'erreur personnalisé pour le client */
  code?: string;
  /** Erreurs détaillées (pour la validation) */
  errors?: Record<string, unknown> | undefined;
  /** Indique si l'erreur est opérationnelle (connue) */
  isOperational?: boolean;
}

/**
 * Classe d'erreur métier
 * 
 * Utilisation:
 * throw new BusinessError({
 *   message: 'Email déjà utilisé',
 *   statusCode: 409,
 *   code: 'EMAIL_EXISTS'
 * });
 */
export class BusinessError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: Record<string, unknown> | undefined;
  public readonly isOperational: boolean;

  constructor(options: BusinessErrorOptions) {
    // Appeler le constructeur de Error
    super(options.message);

    // Nom de la classe d'erreur
    this.name = 'BusinessError';

    // Propriétés personnalisées
    this.statusCode = options.statusCode ?? HTTP_STATUS.BAD_REQUEST;
    this.code = options.code ?? ERROR_CODES.INVALID_INPUT;
    this.errors = options.errors;
    this.isOperational = options.isOperational ?? true;

    // Capture de la pile d'erreur (support pour debugging)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessError);
    }
  }

  /**
   * Convertir l'erreur en objet pour la sérialisation JSON
   */
  toJSON(): Record<string, unknown> {
    const response: Record<string, unknown> = {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
    };

    if (this.errors) {
      response.errors = this.errors;
    }

    return response;
  }
}

/**
 * Factory pour créer rapidement des erreurs métier courantes
 */
export const BusinessErrors = {
  /**
   * Erreur 400 - Données invalides
   */
  badRequest: (message: string, errors?: Record<string, unknown> | undefined): BusinessError => 
    new BusinessError({
      message,
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.INVALID_INPUT,
      errors,
    }),

  /**
   * Erreur 401 - Non autorisé
   */
  unauthorized: (message: string = 'Accès non autorisé.'): BusinessError =>
    new BusinessError({
      message,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      code: ERROR_CODES.UNAUTHORIZED,
    }),

  /**
   * Erreur 403 - Accès refusé
   */
  forbidden: (message: string = 'Accès refusé.'): BusinessError =>
    new BusinessError({
      message,
      statusCode: HTTP_STATUS.FORBIDDEN,
      code: ERROR_CODES.FORBIDDEN,
    }),

  /**
   * Erreur 404 - Ressource non trouvée
   */
  notFound: (message: string = 'Ressource introuvable.'): BusinessError =>
    new BusinessError({
      message,
      statusCode: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
    }),

  /**
   * Erreur 409 - Conflit (ex: email déjà utilisé)
   */
  conflict: (message: string, errors?: Record<string, unknown> | undefined): BusinessError =>
    new BusinessError({
      message,
      statusCode: HTTP_STATUS.CONFLICT,
      code: ERROR_CODES.ALREADY_EXISTS,
      errors,
    }),

  /**
   * Erreur 500 - Erreur interne
   */
  internal: (message: string = 'Une erreur interne s\'est produite.'): BusinessError =>
    new BusinessError({
      message,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_ERROR,
      isOperational: false, // Erreur non opérationnelle (ne doit pas être exposée en prod)
    }),
};
