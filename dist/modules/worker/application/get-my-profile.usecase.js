// ============================================================================
// USE CASE: Obtenir le profil du worker connecté
// ============================================================================
// Ce use case permet à un worker de récupérer son propre profil.
// Sécurisé car l'ID vient du JWT.
// ============================================================================
import { Role } from '@prisma/client';
import { BusinessErrors } from '../../../shared/errors/index.js';
import { WORKER_VALIDATION_MESSAGES } from '../../../shared/constants/messages.js';
/**
 * Use Case: Obtenir le profil du worker connecté
 *
 * RESPONSABILITÉS:
 * - Vérifier que le worker existe
 * - Vérifier que l'utilisateur est un worker (role = WORKER)
 * - Vérifier que le compte n'est pas soft-deleted
 * - Retourner le profil du worker
 *
 * 🔐 SÉCURITÉ:
 * - Le workerId doit venir du JWT (req.user.sub)
 * - Aucune donnée du client n'est acceptée pour l'ID
 */
export class GetMyProfileUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Exécuter le use case
     */
    async execute(input) {
        const { workerId } = input;
        // -------------------------------------------------------------------------
        // ÉTAPE 1: Validation de l'input
        // -------------------------------------------------------------------------
        if (!workerId || typeof workerId !== 'string' || workerId.trim() === '') {
            throw BusinessErrors.badRequest(WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND, { workerId: 'ID du travailleur invalide ou manquant.' });
        }
        // -------------------------------------------------------------------------
        // ÉTAPE 2: Récupération du worker
        // -------------------------------------------------------------------------
        const worker = await this.userRepository.findById(workerId);
        // -------------------------------------------------------------------------
        // ÉTAPE 3: Vérification d'existence
        // -------------------------------------------------------------------------
        if (!worker) {
            throw BusinessErrors.notFound(WORKER_VALIDATION_MESSAGES.WORKER_NOT_FOUND);
        }
        // -------------------------------------------------------------------------
        // ÉTAPE 4: Vérification du rôle
        // -------------------------------------------------------------------------
        if (worker.role !== Role.WORKER) {
            throw BusinessErrors.forbidden(WORKER_VALIDATION_MESSAGES.WORKER_ACCESS_DENIED);
        }
        // -------------------------------------------------------------------------
        // ÉTAPE 5: Vérification que le compte n'est pas soft-deleted
        // -------------------------------------------------------------------------
        if (worker.deletedAt !== null) {
            throw BusinessErrors.forbidden('Votre compte a été supprimé.');
        }
        return {
            user: worker,
        };
    }
}
//# sourceMappingURL=get-my-profile.usecase.js.map