// ============================================================================
// MISSION REPOSITORY INTERFACE FOR PAYMENT MODULE - APPLICATION LAYER
// ============================================================================
// Contrat pour accéder aux missions depuis le module Payment
// ============================================================================

import type { Mission } from '../../mission/domain/index.js';

/**
 * Mission Repository Interface for Payment Module
 * 
 * RESPONSABILITÉ:
 * - Permet au module Payment d'accéder aux données des missions
 * - Découplage entre modules (délégué par le module Mission)
 */
export interface IMissionRepositoryForPayment {
  /**
   * Trouve une mission par son ID
   */
  findById(id: string): Promise<Mission | null>;

  /**
   * Trouve les informations du worker pour une mission (incluant téléphone et email)
   * Utilisé pour permettre au client de contacter le worker après paiement
   */
  findWorkerContactByMissionId(missionId: string): Promise<{
    id: string;
    nom: string;
    prenom: string;
    tel: string;
    email: string;
  } | null>;

  /**
   * Met à jour le statut d'une mission
   */
  updateStatus(id: string, status: string): Promise<Mission>;

  /**
   * Marque la confirmation client
   */
  markClientConfirmed(id: string): Promise<Mission>;

  /**
   * Marque la confirmation worker
   */
  markWorkerConfirmed(id: string): Promise<Mission>;

  /**
   * Vérifie si les deux ont confirmé
   */
  hasBothConfirmed(id: string): Promise<boolean>;
}
