import type { IMissionRepository } from './mission.repository.interface.js';
import { type SetFinalPriceInput, type MissionResponse } from '../domain/index.js';
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
export declare class SetFinalPriceUseCase {
    private readonly missionRepository;
    constructor(missionRepository: IMissionRepository);
    /**
     * Exécute la fixation du prix final
     * @param missionId - ID de la mission
     * @param input - Données du prix final
     * @returns La mission mise à jour
     * @throws BusinessError si la mission n'existe pas ou si le prix ne peut pas être fixé
     */
    execute(missionId: string, input: SetFinalPriceInput): Promise<MissionResponse>;
    /**
     * Valide le prix final
     */
    private validatePrixFinal;
}
//# sourceMappingURL=set-final-price.usecase.d.ts.map