// ============================================================================
// SET FINAL PRICE USE CASE - APPLICATION LAYER
// ============================================================================
// Fixe le prix final après négociation entre le client et le worker
// Transition: CONTACT_UNLOCKED -> NEGOTIATION_DONE
// ============================================================================

import type { IMissionRepository } from './mission.repository.interface.js';
import { Mission, MissionStatus, type SetFinalPriceInput, type MissionResponse } from '../domain/index.js';
import { BusinessErrors } from '../../../shared/errors/index.js';

/**
 * Set Final Price Use Case
 * 
 * RESPONSABILITÉ:
 * - Fixer le prix final après négociation entre le client et le worker
 * - Valider que le prix final est compris entre prixMin et prixMax
 * - Calculer le montant restant (prixFinal - prixMin)
 * - Déterminer le prochain statut:
 *   - Si prixFinal > prixMin: AWAITING_FINAL_PAYMENT
 *   - Si prixFinal === prixMin: IN_PROGRESS
 * - Vérifie que seul le CLIENT peut fixer le prix final (défense en profondeur)
 */
export class SetFinalPriceUseCase {
  private readonly missionRepository: IMissionRepository;

  constructor(missionRepository: IMissionRepository) {
    this.missionRepository = missionRepository;
  }

  /**
   * Exécute la fixation du prix final
   * @param missionId - ID de la mission
   * @param input - Données du prix final
   * @returns La mission mise à jour
   * @throws BusinessError si la mission n'existe pas ou si le prix ne peut pas être fixé
   */
  async execute(missionId: string, input: SetFinalPriceInput): Promise<MissionResponse> {
    // Vérifier que l'ID de la mission est fourni
    if (!missionId || missionId.trim().length === 0) {
      throw BusinessErrors.badRequest('L\'ID de la mission est requis.');
    }

    // Valider le prix final
    this.validatePrixFinal(input.prixFinal);

    // Récupérer la mission
    const mission = await this.missionRepository.findById(missionId);

    if (!mission) {
      throw BusinessErrors.notFound('Mission introuvable.');
    }

    // VÉRIFICATION D'OWNERSHIP: Seul le CLIENT peut fixer le prix final
    // (Le middleware vérifie déjà, mais on fait une vérification supplémentaire pour défense en profondeur)
    if (input.userId && mission.clientId !== input.userId) {
      throw BusinessErrors.forbidden('Seul le client peut fixer le prix final de la mission.');
    }

    // Vérifier que la mission est dans le bon statut
    if (mission.status !== MissionStatus.CONTACT_UNLOCKED) {
      throw BusinessErrors.badRequest(
        `Le prix final ne peut pas être fixé. Statut actuel: ${mission.status}. ` +
        'La mission doit être en statut "Contact déverrouillé".'
      );
    }

    // Valider que le prix final est dans la plage valide
    if (input.prixFinal < mission.prixMin) {
      throw BusinessErrors.badRequest(
        `Le prix final (${input.prixFinal}) ne peut pas être inférieur au prix minimum (${mission.prixMin}).`
      );
    }

    if (input.prixFinal > mission.prixMax) {
      throw BusinessErrors.badRequest(
        `Le prix final (${input.prixFinal}) ne peut pas dépasser le prix maximum (${mission.prixMax}).`
      );
    }

    // Fixer le prix final via l'entité
    const missionWithPrice = mission.setFinalPrice(input.prixFinal);

    // Déterminer le prochain statut basé sur le prix final
    let updatedMission: Mission;

    if (input.prixFinal > mission.prixMin) {
      // Prix final > prix minimum -> attente du paiement final
      updatedMission = new Mission({
        ...missionWithPrice.getProps(),
        status: MissionStatus.AWAITING_FINAL_PAYMENT,
        updatedAt: new Date(),
      });
    } else {
      // Prix final === prix minimum -> مباشرة en cours
      updatedMission = new Mission({
        ...missionWithPrice.getProps(),
        status: MissionStatus.IN_PROGRESS,
        updatedAt: new Date(),
      });
    }

    // Sauvegarder en base de données
    await this.missionRepository.update(missionId, updatedMission);

    return updatedMission.toResponse();
  }

  /**
   * Valide le prix final
   */
  private validatePrixFinal(prixFinal: number): void {
    if (typeof prixFinal !== 'number' || isNaN(prixFinal)) {
      throw BusinessErrors.badRequest('Le prix final doit être un nombre valide.');
    }

    if (prixFinal < 0) {
      throw BusinessErrors.badRequest('Le prix final doit être positif.');
    }
  }
}
