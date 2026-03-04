import type { Mission as PrismaMission } from '@prisma/client';
import { type MissionStatusType, type CancellationRequester } from './mission-status.enum.js';
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
export declare class Mission {
    readonly id: string;
    readonly clientId: string;
    readonly workerId: string;
    readonly serviceId: string;
    readonly prixMin: number;
    readonly prixMax: number;
    readonly prixFinal: number | null;
    readonly montantRestant: number | null;
    readonly cancellationRequestedBy: CancellationRequester | null;
    readonly clientConfirmed: boolean;
    readonly workerConfirmed: boolean;
    readonly status: MissionStatusType;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: MissionProps);
    /**
     * Valide que la plage de prix est valide
     */
    private validatePriceRange;
    /**
     * Valide que le prix final est dans la plage valide
     */
    private validatePrixFinal;
    /**
     * Valide que le montant restant correspond au calcul
     */
    private validateMontantRestant;
    /**
     * Vérifie si une transition de statut est valide
     */
    canTransitionTo(newStatus: MissionStatusType): boolean;
    /**
     * Effectue une transition de statut
     * @throws Error si la transition n'est pas autorisée
     */
    transitionTo(newStatus: MissionStatusType): void;
    /**
     * Méthode publique pour vérifier les transitions (utilisée par les tests)
     */
    checkTransition(newStatus: MissionStatusType): boolean;
    /**
     * Confirme le paiement initial par le client
     * Transition: PENDING_PAYMENT → PENDING_ACCEPT
     *
     * @throws Error si le statut actuel n'est pas PENDING_PAYMENT
     */
    confirmInitialPayment(): Mission;
    /**
     * Le worker accepte la mission
     * Transition: PENDING_ACCEPT → CONTACT_UNLOCKED
     *
     * @throws Error si le statut actuel n'est pas PENDING_ACCEPT
     */
    acceptMission(): Mission;
    /**
     * Le worker refuse la mission
     * Transition: PENDING_ACCEPT → REFUSED
     *
     * @throws Error si le statut actuel n'est pas PENDING_ACCEPT
     */
    refuseMission(): Mission;
    /**
     * Fixe le prix final après négociation
     * Transition: CONTACT_UNLOCKED → NEGOTIATION_DONE
     *
     * Règles:
     * - prixFinal doit être compris entre prixMin et prixMax
     * - Si prixFinal > prixMin: montantRestant = prixFinal - prixMin
     * - Si prixFinal === prixMin: montantRestant = 0
     */
    setFinalPrice(prixFinal: number): Mission;
    /**
     * Détermine le statut après négociation basée sur le prix final
     * Transition: NEGOTIATION_DONE → AWAITING_FINAL_PAYMENT ou IN_PROGRESS
     *
     * @throws Error si le statut actuel n'est pas NEGOTIATION_DONE
     */
    finalizeNegotiation(): Mission;
    /**
     * Confirme le paiement final
     * Transition: AWAITING_FINAL_PAYMENT → IN_PROGRESS
     * OU NEGOTIATION_DONE → IN_PROGRESS (si prixFinal === prixMin)
     */
    confirmFinalPayment(): Mission;
    /**
     * Le client confirme la completion de la mission
     * Transition: IN_PROGRESS (avec double confirmation)
     *
     * @throws Error si le statut actuel n'est pas IN_PROGRESS
     */
    completeByClient(): Mission;
    /**
     * Le worker confirme la completion de la mission
     * Transition: IN_PROGRESS (avec double confirmation)
     *
     * @throws Error si le statut actuel n'est pas IN_PROGRESS
     */
    completeByWorker(): Mission;
    /**
     * Demande l'annulation de la mission
     * Transition: IN_PROGRESS → CANCEL_REQUESTED
     *
     * @param requester - Qui demande l'annulation (CLIENT ou WORKER)
     * @throws Error si le statut actuel n'est pas IN_PROGRESS
     */
    requestCancellation(requester: CancellationRequester): Mission;
    /**
     * Approuve l'annulation après validation Escrow
     * Transition: CANCEL_REQUESTED → CANCELLED
     *
     * @throws Error si le statut actuel n'est pas CANCEL_REQUESTED
     */
    approveCancellation(): Mission;
    /**
     * Rejette l'annulation et reprend la mission
     * Transition: CANCEL_REQUESTED → IN_PROGRESS
     *
     * @throws Error si le statut actuel n'est pas CANCEL_REQUESTED
     */
    rejectCancellation(): Mission;
    /**
     * Annule la mission directement (sans passer par CANCEL_REQUESTED)
     * Transition: PENDING_PAYMENT, PENDING_ACCEPT, CONTACT_UNLOCKED,
     *             NEGOTIATION_DONE, AWAITING_FINAL_PAYMENT → CANCELLED
     *
     * @throws Error si la mission est en cours ou terminée
     */
    cancel(): Mission;
    /**
     * Vérifie si la mission peut être annulée directement
     */
    canCancel(): boolean;
    /**
     * Vérifie si la mission peut demander une annulation
     */
    canRequestCancellation(): boolean;
    /**
     * Vérifie si la mission peut être complétée
     */
    canComplete(): boolean;
    /**
     * Vérifie si la mission est terminée
     */
    isCompleted(): boolean;
    /**
     * Vérifie si la mission est annulée
     */
    isCancelled(): boolean;
    /**
     * Vérifie si la mission est refusée
     */
    isRefused(): boolean;
    /**
     * Vérifie si la mission est en cours
     */
    isInProgress(): boolean;
    /**
     * Vérifie si un paiement est en attente
     */
    isPendingPayment(): boolean;
    /**
     * Vérifie si la mission est en attente d'acceptation par le worker
     */
    isPendingAccept(): boolean;
    /**
     * Vérifie si la mission est en attente d'annulation
     */
    isCancellationRequested(): boolean;
    /**
     * Vérifie si la mission est en attente de confirmation par le client
     */
    isAwaitingClientConfirmation(): boolean;
    /**
     * Vérifie si la mission est en attente de confirmation par le worker
     */
    isAwaitingWorkerConfirmation(): boolean;
    /**
     * Convertit en objet pour la réponse API
     */
    toResponse(): MissionResponse;
    /**
     * Convertit en propriétés (pour la création d'une nouvelle instance)
     */
    private toProps;
    /**
     * Retourne les propriétés pour mutation externe (use cases)
     */
    getProps(): MissionProps;
    /**
     * Crée une Mission à partir d'une entité Prisma (Factory method)
     * Utilise une assertion de type pour gérer les champs ajoutés par migration
     */
    static fromPrisma(mission: PrismaMission): Mission;
}
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
//# sourceMappingURL=mission.entity.d.ts.map