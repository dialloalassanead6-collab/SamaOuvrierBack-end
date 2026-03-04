// ============================================================================
// CREATE MISSION USE CASE - APPLICATION LAYER
// ============================================================================
// Crée une nouvelle mission
// ============================================================================
import { Mission, MissionStatus } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';
/**
 * Create Mission Use Case
 *
 * RESPONSABILITÉ:
 * - Créer une nouvelle mission avec les données fournies
 * - Valider que le service existe et appartient au worker
 * - Valider que l'utilisateur connecté est le client
 * - Récupérer les prix min/max depuis le Service (règle métier)
 * - Initialiser le statut à PENDING_PAYMENT
 */
export class CreateMissionUseCase {
    missionRepository;
    serviceRepository;
    constructor(missionRepository, serviceRepository) {
        this.missionRepository = missionRepository;
        this.serviceRepository = serviceRepository;
    }
    /**
     * Exécute la création d'une mission
     * @param input - Données de création de la mission (workerId, serviceId)
     * @param authenticatedUserId - ID de l'utilisateur authentifié (sera le clientId)
     * @returns La mission créée
     * @throws BusinessError si les données sont invalides
     */
    async execute(input, authenticatedUserId) {
        // Validation des données d'entrée
        this.validateInput(input);
        // IMPORTANT: Le clientId doit être l'utilisateur authentifié
        // C'est une règle de sécurité critique
        const clientId = authenticatedUserId;
        // Vérifier que le service existe
        const service = await this.serviceRepository.findById(input.serviceId);
        if (!service) {
            throw BusinessErrors.notFound('Service introuvable.');
        }
        // Vérifier que le service appartient au worker fourni
        if (service.workerId !== input.workerId) {
            throw BusinessErrors.badRequest('Le service sélectionné n\'appartient pas au worker spécifié.');
        }
        // Vérifier que le client n'est pas le même que le worker
        if (clientId === input.workerId) {
            throw BusinessErrors.badRequest('Le client et le worker ne peuvent pas être la même personne.');
        }
        // Récupérer les prix depuis le Service (règle métier)
        const prixMin = Number(service.minPrice);
        const prixMax = Number(service.maxPrice);
        // Valider que les prix sont cohérents
        if (prixMax < prixMin) {
            throw BusinessErrors.badRequest('Le prix maximum du service est invalide.');
        }
        // Créer l'entité Mission avec les prix copiés depuis le Service
        const now = new Date();
        const mission = new Mission({
            id: crypto.randomUUID(),
            clientId: clientId,
            workerId: input.workerId,
            serviceId: input.serviceId,
            prixMin: prixMin,
            prixMax: prixMax,
            prixFinal: null,
            montantRestant: null,
            cancellationRequestedBy: null,
            clientConfirmed: false,
            workerConfirmed: false,
            status: MissionStatus.PENDING_PAYMENT,
            createdAt: now,
            updatedAt: now,
        });
        // Sauvegarder en base de données
        const createdMission = await this.missionRepository.create({
            clientId: mission.clientId,
            workerId: mission.workerId,
            serviceId: mission.serviceId,
            prixMin: mission.prixMin,
            prixMax: mission.prixMax,
        });
        return createdMission.toResponse();
    }
    /**
     * Valide les données d'entrée
     */
    validateInput(input) {
        if (!input.workerId || input.workerId.trim().length === 0) {
            throw BusinessErrors.badRequest('L\'ID du worker est requis.');
        }
        if (!input.serviceId || input.serviceId.trim().length === 0) {
            throw BusinessErrors.badRequest('L\'ID du service est requis.');
        }
    }
}
//# sourceMappingURL=create-mission.usecase.js.map