import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
/**
 * Options pour le middleware de vérification de propriété
 */
export interface MissionOwnershipOptions {
    /** Roles qui ont accès à toutes les missions (ex: ADMIN) */
    allowedRoles?: Role[];
    /** Vérifier uniquement pour les actions de modification */
    requireOwnership?: boolean;
}
/**
 * Middleware de vérification de propriété de mission
 *
 * RESPONSABILITÉS:
 * - Vérifier que l'utilisateur authentifié est le client ou le worker de la mission
 * - Permettre l'accès aux administrateurs
 * - Bloquer l'accès aux utilisateurs non autorisés
 */
export declare const verifyMissionOwnership: (options?: MissionOwnershipOptions) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=verify-mission-ownership.middleware.d.ts.map