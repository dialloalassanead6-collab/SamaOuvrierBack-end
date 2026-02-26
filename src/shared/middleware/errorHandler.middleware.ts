// ============================================================================
// MIDDLEWARE DE GESTION DES ERREURS GLOBALE
// ============================================================================
// Ce middleware gère tous les types d'erreurs de l'application:
// - Erreurs métier (BusinessError)
// - Erreurs de validation Zod
// - Erreurs Prisma
// - Erreurs inconnue
//
// En production:
// - Les messages d'erreur métier sont exposés
// - Les erreurs techniques (stack, paths) NE SONT JAMAIS exposées
// - Seuls les erreurs opérationnelles sont détaillées
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { NODE_ENV } from '../config/config.js';
import { SYSTEM_MESSAGES, HTTP_STATUS, ERROR_CODES } from '../constants/messages.js';
import { BusinessError } from '../errors/business-error.js';

/**
 * Interface pour les erreurs avec statusCode
 */
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

/**
 * Middleware de gestion des erreurs global
 * 
 * @param err - Erreur capturée
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param _next - Fonction next (non utilisée mais requise par Express)
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Logging en développement uniquement
  if (NODE_ENV === 'development') {
    console.error('═══════════════════════════════════════════════════');
    console.error('🔴 ERREUR DÉTAILLÉE (ENV: development)');
    console.error('═══════════════════════════════════════════════════');
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Message:', err.message);
    console.error('Status:', err.statusCode);
    console.error('Code:', err.code || 'N/A');
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
    console.error('═══════════════════════════════════════════════════');
  }

  // Déterminer le type d'erreur et formatter la réponse
  const errorResponse = formatErrorResponse(err, NODE_ENV);

  // Envoyer la réponse
  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.message,
    code: errorResponse.code,
    ...(errorResponse.errors && { errors: errorResponse.errors }),
    // Stack uniquement en développement
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Formater la réponse d'erreur selon le type d'erreur
 */
function formatErrorResponse(
  err: AppError,
  nodeEnv: string
): { statusCode: number; message: string; code: string; errors?: Record<string, unknown> } {
  // 1. Erreur métier (BusinessError) - Message déjà en français
  if (err instanceof BusinessError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      ...(err.errors && { errors: err.errors }),
    };
  }

  // 2. Erreur de validation Zod
  if (err instanceof ZodError) {
    const validationErrors: Record<string, unknown> = {};
    
    const zodIssues = err.issues;
    zodIssues.forEach((issue) => {
      const path = issue.path.join('.');
      validationErrors[path] = issue.message;
    });

    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Les données fournies ne sont pas valides.',
      code: ERROR_CODES.VALIDATION_ERROR,
      errors: validationErrors,
    };
  }

  // 3. Erreur Prisma - Ne jamais exposer les détails en production
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Mapper les erreurs Prisma courantes vers des messages français
    const prismaMessage = mapPrismaError(err, nodeEnv);
    
    return {
      statusCode: prismaMessage.statusCode,
      message: prismaMessage.message,
      code: ERROR_CODES.DB_ERROR,
    };
  }

  // 4. Erreur de contrainte Prisma (autres types)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Erreur de validation des données.',
      code: ERROR_CODES.VALIDATION_ERROR,
    };
  }

  // 5. Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: SYSTEM_MESSAGES.TOKEN_INVALID,
      code: ERROR_CODES.UNAUTHORIZED,
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: SYSTEM_MESSAGES.TOKEN_EXPIRED,
      code: ERROR_CODES.UNAUTHORIZED,
    };
  }

  // 6. Erreur inconnue ou interne
  // En production, NE JAMAIS exposer le message d'erreur interne
  if (nodeEnv === 'production') {
    // Logger l'erreur pour le debugging (mais pas pour l'utilisateur)
    console.error('Erreur interne non gérée:', err.message, err.stack);
    
    return {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: SYSTEM_MESSAGES.INTERNAL_ERROR,
      code: ERROR_CODES.INTERNAL_ERROR,
    };
  }

  // En développement, montrer plus de détails
  return {
    statusCode: err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: err.message || SYSTEM_MESSAGES.INTERNAL_ERROR,
    code: ERROR_CODES.INTERNAL_ERROR,
  };
}

/**
 * Mapper les erreurs Prisma vers des messages français
 */
function mapPrismaError(
  err: Prisma.PrismaClientKnownRequestError,
  nodeEnv: string
): { statusCode: number; message: string } {
  // Erreurs courantes Prisma
  switch (err.code) {
    case 'P2002': // Unique constraint failed
      return {
        statusCode: HTTP_STATUS.CONFLICT,
        message: 'Cette valeur existe déjà. Veuillez utiliser une valeur différente.',
      };

    case 'P2003': // Foreign key constraint failed
      return {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Référence invalide. La donnée liée n\'existe pas.',
      };

    case 'P2014': // The change you are trying to make would violate the required relation
      return {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: 'Violation de contrainte de relation.',
      };

    case 'P2025': // Record to update not found
      return {
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: 'Enregistrement introuvable.',
      };

    default:
      // Log l'erreur originale en développement pour debugging
      if (nodeEnv === 'development') {
        console.error('Prisma Error Code:', err.code);
        console.error('Prisma Message:', err.message);
      }
      
      return {
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: SYSTEM_MESSAGES.INTERNAL_ERROR,
      };
  }
}

/**
 * Créer une nouvelle erreur opérationnelle
 */
export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

/**
 * Gestionnaire pour les routes non trouvées (404)
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: SYSTEM_MESSAGES.ROUTE_NOT_FOUND,
    code: ERROR_CODES.NOT_FOUND,
  });
};
