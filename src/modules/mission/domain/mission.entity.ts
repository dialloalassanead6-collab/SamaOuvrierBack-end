// ============================================================================
// MISSION ENTITY - DOMAIN LAYER
// ============================================================================
// Représente le cœur métier "Mission" avec ses règles et invariants
// Encapsule la machine à états pour gérer les transitions de statut
// ============================================================================

import type { Mission as PrismaMission } from '@prisma/client';
import {
  MissionStatus,
  MISSION_STATUS_TRANSITIONS,
  type MissionStatusType,
  type CancellationRequester,
} from './mission-status.enum.js';

/**
 * Mission Entity - Objet métier principal
 * 
 * RESPONSABILITÉS:
 * - Représenter une mission dans le système
 * - Encapsuler les règles métier liées aux missions
 * - Gérer la machine à états des statuts
 * - Être indépendant de tout framework (framework-agnostic)
 * 
 * INVARIANTS:
 * - clientId, workerId, serviceId sont obligatoires
 * - prixMin et prixMax doivent être >= 0
 * - prixMax doit être >= prixMin
 * - prixFinal (si défini) doit être compris entre prixMin et prixMax
 * - montantRestant (si défini) doit être = prixFinal - prixMin
 * - cancellationRequestedBy peut être défini uniquement en statut CANCEL_REQUESTED
 * - clientConfirmed et workerConfirmed pour la double confirmation de completion
 */
export class Mission {
  public readonly id: string;
  public readonly clientId: string;
  public readonly workerId: string;
  public readonly serviceId: string;
  public readonly prixMin: number;
  public readonly prixMax: number;
  public readonly prixFinal: number | null;
  public readonly montantRestant: number | null;
  public readonly cancellationRequestedBy: CancellationRequester | null;
  public readonly clientConfirmed: boolean;
  public readonly workerConfirmed: boolean;
  public readonly status: MissionStatusType;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: MissionProps) {
    // Validate invariants in constructor
    this.validatePriceRange(props.prixMin, props.prixMax);
    
    if (props.prixFinal !== null) {
      this.validatePrixFinal(props.prixFinal, props.prixMin, props.prixMax);
    }
    
    if (props.montantRestant !== null && props.prixFinal !== null) {
      this.validateMontantRestant(props.montantRestant, props.prixFinal, props.prixMin);
    }

    this.id = props.id;
    this.clientId = props.clientId;
    this.workerId = props.workerId;
    this.serviceId = props.serviceId;
    this.prixMin = props.prixMin;
    this.prixMax = props.prixMax;
    this.prixFinal = props.prixFinal;
    this.montantRestant = props.montantRestant;
    this.cancellationRequestedBy = props.cancellationRequestedBy ?? null;
    this.clientConfirmed = props.clientConfirmed;
    this.workerConfirmed = props.workerConfirmed;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ============================================================================
  // VALIDATIONS D'INVARIANTS
  // ============================================================================

  /**
   * Valide que la plage de prix est valide
   */
  private validatePriceRange(prixMin: number, prixMax: number): void {
    if (prixMin < 2000) {
      throw new Error('Le prix minimum doit être supérieur ou égal à 2000');
    }
    if (prixMax < 2000) {
      throw new Error('Le prix maximum doit être supérieur ou égal à 2000');
    }
    if (prixMax < prixMin) {
      throw new Error('Le prix maximum doit être supérieur ou égal au prix minimum');
    }
  }

  /**
   * Valide que le prix final est dans la plage valide
   */
  private validatePrixFinal(prixFinal: number, prixMin: number, prixMax: number): void {
    if (prixFinal < prixMin) {
      throw new Error(`Le prix final (${prixFinal}) ne peut pas être inférieur au prix minimum (${prixMin})`);
    }
    if (prixFinal > prixMax) {
      throw new Error(`Le prix final (${prixFinal}) ne peut pas dépasser le prix maximum (${prixMax})`);
    }
  }

  /**
   * Valide que le montant restant correspond au calcul
   */
  private validateMontantRestant(montantRestant: number, prixFinal: number, prixMin: number): void {
    const expectedMontantRestant = prixFinal - prixMin;
    if (Math.abs(montantRestant - expectedMontantRestant) > 0.01) {
      throw new Error(`Le montant restant (${montantRestant}) doit être égal à prixFinal - prixMin (${expectedMontantRestant})`);
    }
  }

  // ============================================================================
  // MACHINE À ÉTATS - TRANSITIONS DE STATUT
  // ============================================================================

  /**
   * Vérifie si une transition de statut est valide
   */
  public canTransitionTo(newStatus: MissionStatusType): boolean {
    const allowedTransitions = MISSION_STATUS_TRANSITIONS[this.status as MissionStatus];
    return allowedTransitions.includes(newStatus as MissionStatus);
  }

  /**
   * Effectue une transition de statut
   * @throws Error si la transition n'est pas autorisée
   */
  public transitionTo(newStatus: MissionStatusType): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Transition invalide: impossible de passer de ${this.status} à ${newStatus}. ` +
        `Statuts possibles: ${MISSION_STATUS_TRANSITIONS[this.status as MissionStatus].join(', ')}`
      );
    }
  }

  /**
   * Méthode publique pour vérifier les transitions (utilisée par les tests)
   */
  public checkTransition(newStatus: MissionStatusType): boolean {
    return this.canTransitionTo(newStatus);
  }

  // ============================================================================
  // MÉTHODES DE TRANSITION DE STATUT (Use Cases)
  // ============================================================================

  /**
   * Confirme le paiement initial par le client
   * Transition: PENDING_PAYMENT → PENDING_ACCEPT
   * 
   * @throws Error si le statut actuel n'est pas PENDING_PAYMENT
   */
  public confirmInitialPayment(): Mission {
    if (this.status !== MissionStatus.PENDING_PAYMENT) {
      throw new Error(
        `Impossible de confirmer le paiement initial. Statut actuel: ${this.status}. ` +
        `Attendu: PENDING_PAYMENT`
      );
    }
    
    return new Mission({
      ...this.toProps(),
      status: MissionStatus.PENDING_ACCEPT,
      updatedAt: new Date(),
    });
  }

  /**
   * Le worker accepte la mission
   * Transition: PENDING_ACCEPT → CONTACT_UNLOCKED
   * 
   * @throws Error si le statut actuel n'est pas PENDING_ACCEPT
   */
  public acceptMission(): Mission {
    if (this.status !== MissionStatus.PENDING_ACCEPT) {
      throw new Error(
        `Impossible d'accepter la mission. Statut actuel: ${this.status}. ` +
        `Attendu: PENDING_ACCEPT`
      );
    }
    
    return new Mission({
      ...this.toProps(),
      status: MissionStatus.CONTACT_UNLOCKED,
      updatedAt: new Date(),
    });
  }

  /**
   * Le worker refuse la mission
   * Transition: PENDING_ACCEPT → REFUSED
   * 
   * @throws Error si le statut actuel n'est pas PENDING_ACCEPT
   */
  public refuseMission(): Mission {
    if (this.status !== MissionStatus.PENDING_ACCEPT) {
      throw new Error(
        `Impossible de refuser la mission. Statut actuel: ${this.status}. ` +
        `Attendu: PENDING_ACCEPT`
      );
    }
    
    return new Mission({
      ...this.toProps(),
      status: MissionStatus.REFUSED,
      updatedAt: new Date(),
    });
  }

  /**
   * Fixe le prix final après négociation
   * Transition: CONTACT_UNLOCKED → NEGOTIATION_DONE
   * 
   * Règles:
   * - prixFinal doit être compris entre prixMin et prixMax
   * - Si prixFinal > prixMin: montantRestant = prixFinal - prixMin
   * - Si prixFinal === prixMin: montantRestant = 0
   */
  public setFinalPrice(prixFinal: number): Mission {
    if (this.status !== MissionStatus.CONTACT_UNLOCKED) {
      throw new Error(
        `Impossible de fixer le prix final. Statut actuel: ${this.status}. ` +
        `Attendu: CONTACT_UNLOCKED`
      );
    }
    
    this.validatePrixFinal(prixFinal, this.prixMin, this.prixMax);
    
    const montantRestant = prixFinal - this.prixMin;
    
    return new Mission({
      ...this.toProps(),
      prixFinal,
      montantRestant: Math.max(0, montantRestant),
      status: MissionStatus.NEGOTIATION_DONE,
      updatedAt: new Date(),
    });
  }

  /**
   * Détermine le statut après négociation basée sur le prix final
   * Transition: NEGOTIATION_DONE → AWAITING_FINAL_PAYMENT ou IN_PROGRESS
   * 
   * @throws Error si le statut actuel n'est pas NEGOTIATION_DONE
   */
  public finalizeNegotiation(): Mission {
    if (this.status !== MissionStatus.NEGOTIATION_DONE) {
      throw new Error(
        `Impossible de finaliser la négociation. Statut actuel: ${this.status}. ` +
        `Attendu: NEGOTIATION_DONE`
      );
    }
    
    if (this.prixFinal === null) {
      throw new Error('Le prix final doit être défini avant de finaliser la négociation');
    }
    
    // Si prixFinal > prixMin, on passe en attente du paiement final
    if (this.prixFinal > this.prixMin) {
      return new Mission({
        ...this.toProps(),
        status: MissionStatus.AWAITING_FINAL_PAYMENT,
        updatedAt: new Date(),
      });
    }
    
    // Si prixFinal === prixMin, on passe directement en cours
    return new Mission({
      ...this.toProps(),
      status: MissionStatus.IN_PROGRESS,
      updatedAt: new Date(),
    });
  }

  /**
   * Confirme le paiement final
   * Transition: AWAITING_FINAL_PAYMENT → IN_PROGRESS
   * OU NEGOTIATION_DONE → IN_PROGRESS (si prixFinal === prixMin)
   */
  public confirmFinalPayment(): Mission {
    // Si on vient de NEGOTIATION_DONE avec prixFinal === prixMin
    if (this.status === MissionStatus.NEGOTIATION_DONE && 
        this.prixFinal !== null && 
        this.prixFinal === this.prixMin) {
      return new Mission({
        ...this.toProps(),
        status: MissionStatus.IN_PROGRESS,
        updatedAt: new Date(),
      });
    }
    
    // Sinon si on vient de AWAITING_FINAL_PAYMENT
    if (this.status !== MissionStatus.AWAITING_FINAL_PAYMENT) {
      throw new Error(
        `Impossible de confirmer le paiement final. Statut actuel: ${this.status}. ` +
        `Attendu: AWAITING_FINAL_PAYMENT ou NEGOTIATION_DONE (avec prixFinal === prixMin)`
      );
    }
    
    return new Mission({
      ...this.toProps(),
      status: MissionStatus.IN_PROGRESS,
      updatedAt: new Date(),
    });
  }

  /**
   * Le client confirme la completion de la mission
   * Transition: IN_PROGRESS (avec double confirmation)
   * 
   * @throws Error si le statut actuel n'est pas IN_PROGRESS
   */
  public completeByClient(): Mission {
    if (this.status !== MissionStatus.IN_PROGRESS) {
      throw new Error(
        `Le client ne peut pas confirmer la mission. Statut actuel: ${this.status}. ` +
        `Attendu: IN_PROGRESS`
      );
    }
    
    // Si le worker a déjà confirmé, on passe à COMPLETED
    if (this.workerConfirmed) {
      return new Mission({
        ...this.toProps(),
        clientConfirmed: true,
        status: MissionStatus.COMPLETED,
        updatedAt: new Date(),
      });
    }
    
    // Sinon on garde IN_PROGRESS mais on marque clientConfirmed
    return new Mission({
      ...this.toProps(),
      clientConfirmed: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Le worker confirme la completion de la mission
   * Transition: IN_PROGRESS (avec double confirmation)
   * 
   * @throws Error si le statut actuel n'est pas IN_PROGRESS
   */
  public completeByWorker(): Mission {
    if (this.status !== MissionStatus.IN_PROGRESS) {
      throw new Error(
        `Le worker ne peut pas confirmer la mission. Statut actuel: ${this.status}. ` +
        `Attendu: IN_PROGRESS`
      );
    }
    
    // Si le client a déjà confirmé, on passe à COMPLETED
    if (this.clientConfirmed) {
      return new Mission({
        ...this.toProps(),
        workerConfirmed: true,
        status: MissionStatus.COMPLETED,
        updatedAt: new Date(),
      });
    }
    
    // Sinon on garde IN_PROGRESS mais on marque workerConfirmed
    return new Mission({
      ...this.toProps(),
      workerConfirmed: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Demande l'annulation de la mission
   * Transition: IN_PROGRESS → CANCEL_REQUESTED
   * 
   * @param requester - Qui demande l'annulation (CLIENT ou WORKER)
   * @throws Error si le statut actuel n'est pas IN_PROGRESS
   */
  public requestCancellation(requester: CancellationRequester): Mission {
    if (this.status !== MissionStatus.IN_PROGRESS) {
      throw new Error(
        `Impossible de demander l'annulation. Statut actuel: ${this.status}. ` +
        `Attendu: IN_PROGRESS`
      );
    }
    
    return new Mission({
      ...this.toProps(),
      cancellationRequestedBy: requester,
      status: MissionStatus.CANCEL_REQUESTED,
      updatedAt: new Date(),
    });
  }

  /**
   * Approuve l'annulation après validation Escrow
   * Transition: CANCEL_REQUESTED → CANCELLED
   * 
   * @throws Error si le statut actuel n'est pas CANCEL_REQUESTED
   */
  public approveCancellation(): Mission {
    if (this.status !== MissionStatus.CANCEL_REQUESTED) {
      throw new Error(
        `Impossible d'approuver l'annulation. Statut actuel: ${this.status}. ` +
        `Attendu: CANCEL_REQUESTED`
      );
    }
    
    return new Mission({
      ...this.toProps(),
      status: MissionStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  /**
   * Rejette l'annulation et reprend la mission
   * Transition: CANCEL_REQUESTED → IN_PROGRESS
   * 
   * @throws Error si le statut actuel n'est pas CANCEL_REQUESTED
   */
  public rejectCancellation(): Mission {
    if (this.status !== MissionStatus.CANCEL_REQUESTED) {
      throw new Error(
        `Impossible de rejeter l'annulation. Statut actuel: ${this.status}. ` +
        `Attendu: CANCEL_REQUESTED`
      );
    }
    
    return new Mission({
      ...this.toProps(),
      cancellationRequestedBy: null,
      status: MissionStatus.IN_PROGRESS,
      updatedAt: new Date(),
    });
  }

  /**
   * Annule la mission directement (sans passer par CANCEL_REQUESTED)
   * Transition: PENDING_PAYMENT, PENDING_ACCEPT, CONTACT_UNLOCKED, 
   *             NEGOTIATION_DONE, AWAITING_FINAL_PAYMENT → CANCELLED
   * 
   * @throws Error si la mission est en cours ou terminée
   */
  public cancel(): Mission {
    if (this.status === MissionStatus.COMPLETED) {
      throw new Error('Impossible d\'annuler une mission terminée');
    }
    if (this.status === MissionStatus.CANCELLED) {
      throw new Error('La mission est déjà annulée');
    }
    if (this.status === MissionStatus.REFUSED) {
      throw new Error('La mission a déjà été refusée');
    }
    if (this.status === MissionStatus.CANCEL_REQUESTED) {
      throw new Error('Utilisez approveCancellation() ou rejectCancellation() pour traiter cette demande');
    }
    if (this.status === MissionStatus.IN_PROGRESS) {
      throw new Error('Utilisez requestCancellation() pour les missions en cours');
    }
    
    return new Mission({
      ...this.toProps(),
      status: MissionStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  // ============================================================================
  // MÉTHODES UTILITAIRES
  // ============================================================================

  /**
   * Vérifie si la mission peut être annulée directement
   */
  public canCancel(): boolean {
    return this.status !== MissionStatus.COMPLETED && 
           this.status !== MissionStatus.CANCELLED &&
           this.status !== MissionStatus.CANCEL_REQUESTED &&
           this.status !== MissionStatus.IN_PROGRESS &&
           this.status !== MissionStatus.REFUSED;
  }

  /**
   * Vérifie si la mission peut demander une annulation
   */
  public canRequestCancellation(): boolean {
    return this.status === MissionStatus.IN_PROGRESS;
  }

  /**
   * Vérifie si la mission peut être complétée
   */
  public canComplete(): boolean {
    return this.status === MissionStatus.IN_PROGRESS;
  }

  /**
   * Vérifie si la mission est terminée
   */
  public isCompleted(): boolean {
    return this.status === MissionStatus.COMPLETED;
  }

  /**
   * Vérifie si la mission est annulée
   */
  public isCancelled(): boolean {
    return this.status === MissionStatus.CANCELLED;
  }

  /**
   * Vérifie si la mission est refusée
   */
  public isRefused(): boolean {
    return this.status === MissionStatus.REFUSED;
  }

  /**
   * Vérifie si la mission est en cours
   */
  public isInProgress(): boolean {
    return this.status === MissionStatus.IN_PROGRESS;
  }

  /**
   * Vérifie si un paiement est en attente
   */
  public isPendingPayment(): boolean {
    return this.status === MissionStatus.PENDING_PAYMENT || 
           this.status === MissionStatus.AWAITING_FINAL_PAYMENT;
  }

  /**
   * Vérifie si la mission est en attente d'acceptation par le worker
   */
  public isPendingAccept(): boolean {
    return this.status === MissionStatus.PENDING_ACCEPT;
  }

  /**
   * Vérifie si la mission est en attente d'annulation
   */
  public isCancellationRequested(): boolean {
    return this.status === MissionStatus.CANCEL_REQUESTED;
  }

  /**
   * Vérifie si la mission est en attente de confirmation par le client
   */
  public isAwaitingClientConfirmation(): boolean {
    return this.status === MissionStatus.IN_PROGRESS && !this.clientConfirmed;
  }

  /**
   * Vérifie si la mission est en attente de confirmation par le worker
   */
  public isAwaitingWorkerConfirmation(): boolean {
    return this.status === MissionStatus.IN_PROGRESS && !this.workerConfirmed;
  }

  /**
   * Convertit en objet pour la réponse API
   */
  public toResponse(): MissionResponse {
    return {
      id: this.id,
      clientId: this.clientId,
      workerId: this.workerId,
      serviceId: this.serviceId,
      prixMin: this.prixMin,
      prixMax: this.prixMax,
      prixFinal: this.prixFinal,
      montantRestant: this.montantRestant,
      cancellationRequestedBy: this.cancellationRequestedBy,
      clientConfirmed: this.clientConfirmed,
      workerConfirmed: this.workerConfirmed,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convertit en propriétés (pour la création d'une nouvelle instance)
   */
  private toProps(): MissionProps {
    return {
      id: this.id,
      clientId: this.clientId,
      workerId: this.workerId,
      serviceId: this.serviceId,
      prixMin: this.prixMin,
      prixMax: this.prixMax,
      prixFinal: this.prixFinal,
      montantRestant: this.montantRestant,
      cancellationRequestedBy: this.cancellationRequestedBy,
      clientConfirmed: this.clientConfirmed,
      workerConfirmed: this.workerConfirmed,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Retourne les propriétés pour mutation externe (use cases)
   */
  public getProps(): MissionProps {
    return this.toProps();
  }

  /**
   * Crée une Mission à partir d'une entité Prisma (Factory method)
   * Utilise une assertion de type pour gérer les champs ajoutés par migration
   */
  static fromPrisma(mission: PrismaMission): Mission {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyMission = mission as any;
    
    return new Mission({
      id: mission.id,
      clientId: mission.clientId,
      workerId: mission.workerId,
      serviceId: mission.serviceId,
      prixMin: Number(mission.prixMin),
      prixMax: Number(mission.prixMax),
      prixFinal: mission.prixFinal !== null ? Number(mission.prixFinal) : null,
      montantRestant: mission.montantRestant !== null ? Number(mission.montantRestant) : null,
      cancellationRequestedBy: (anyMission.cancellationRequestedBy as CancellationRequester) ?? null,
      clientConfirmed: anyMission.clientConfirmed ?? false,
      workerConfirmed: anyMission.workerConfirmed ?? false,
      status: mission.status as MissionStatusType,
      createdAt: mission.createdAt,
      updatedAt: mission.updatedAt,
    });
  }
}

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

/**
 * Propriétés d'une mission
 */
export interface MissionProps {
  id: string;
  clientId: string;
  workerId: string;
  serviceId: string;
  prixMin: number;
  prixMax: number;
  prixFinal: number | null;
  montantRestant: number | null;
  cancellationRequestedBy: CancellationRequester | null;
  clientConfirmed: boolean;
  workerConfirmed: boolean;
  status: MissionStatusType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Réponse DTO pour l'API
 */
export interface MissionResponse {
  id: string;
  clientId: string;
  workerId: string;
  serviceId: string;
  prixMin: number;
  prixMax: number;
  prixFinal: number | null;
  montantRestant: number | null;
  cancellationRequestedBy: CancellationRequester | null;
  clientConfirmed: boolean;
  workerConfirmed: boolean;
  status: MissionStatusType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entrée pour créer une nouvelle mission
 */
export interface CreateMissionInput {
  workerId: string;
  serviceId: string;
}

/**
 * Entrée pour mettre à jour une mission (prix final)
 * Inclut userId pour vérification d'ownership
 */
export interface SetFinalPriceInput {
  userId: string;
  prixFinal: number;
}

/**
 * Entrée pour demander une annulation
 */
export interface RequestCancellationInput {
  requester: CancellationRequester;
}

/**
 * Entrée pour traiter une demande d'annulation
 */
export interface ProcessCancellationInput {
  approved: boolean;
}

/**
 * Mission avec les détails du client et du worker (pour les réponses enrichies)
 * NOTE: Les données sensibles (email, tel) ont été retirées pour la sécurité
 */
export interface MissionWithDetails extends MissionResponse {
  client?: {
    id: string;
    nom: string;
    prenom: string;
  } | null;
  worker?: {
    id: string;
    nom: string;
    prenom: string;
  } | null;
  service?: {
    id: string;
    title: string;
    description: string;
  } | null;
}
