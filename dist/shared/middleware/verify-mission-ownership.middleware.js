// ============================================================================
// VERIFY MISSION OWNERSHIP MIDDLEWARE - SHARED LAYER
// ============================================================================
// Vérifie que l'utilisateur a le droit d'accéder à une mission
// Utilisé pour sécuriser les endpoints de mission
// ============================================================================
import { Role } from '@prisma/client';
import { missionRepository } from '../../modules/mission/infrastructure/prisma-mission.repository.js';
import { BusinessErrors } from '../errors/business-error.js';
/**
 * Middleware de vérification de propriété de mission
 *
 * RESPONSABILITÉS:
 * - Vérifier que l'utilisateur authentifié est le client ou le worker de la mission
 * - Permettre l'accès aux administrateurs
 * - Bloquer l'accès aux utilisateurs non autorisés
 */
export const verifyMissionOwnership = (options = {}) => {
    const { allowedRoles = [Role.ADMIN], requireOwnership = true } = options;
    return async (req, _res, next) => {
        try {
            // Vérifier que l'utilisateur est authentifié
            if (!req.user) {
                throw BusinessErrors.unauthorized('Vous devez être authentifié.');
            }
            const missionId = req.params.id;
            if (!missionId || typeof missionId !== 'string') {
                throw BusinessErrors.badRequest('ID de mission invalide.');
            }
            const userId = req.user.sub;
            const userRole = req.user.role;
            // Si l'utilisateur a un rôle autorisé (ex: ADMIN), autoriser l'accès
            if (allowedRoles.includes(userRole)) {
                return next();
            }
            // Si requireOwnership est false, permettre l'accès sans vérification de propriété
            if (!requireOwnership) {
                return next();
            }
            // Récupérer la mission pour vérifier la propriété
            const mission = await missionRepository.findById(missionId);
            if (!mission) {
                throw BusinessErrors.notFound('Mission introuvable.');
            }
            // Vérifier que l'utilisateur est le client ou le worker
            if (mission.clientId !== userId && mission.workerId !== userId) {
                throw BusinessErrors.forbidden('Vous n\'êtes pas autorisé à accéder à cette mission.');
            }
            // Ajouter les infos de la mission à la requête pour usage dans le contrôleur
            req.body.mission = mission;
            req.body.missionUserRole = mission.clientId === userId ? 'CLIENT' : 'WORKER';
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
//# sourceMappingURL=verify-mission-ownership.middleware.js.map