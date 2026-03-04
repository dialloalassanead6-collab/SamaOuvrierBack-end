export declare enum MissionStatus {
    /**
     * En attente de paiement initial
     * La mission a été créée mais le paiement initial n'a pas encore été confirmé
     */
    PENDING_PAYMENT = "PENDING_PAYMENT",
    /**
     * En attente d'acceptation
     * Le paiement initial a été confirmé, en attente d'acceptation par le worker
     */
    PENDING_ACCEPT = "PENDING_ACCEPT",
    /**
     * Contact déverrouillé
     * Le worker a accepté la mission, le client peut voir les coordonnées du worker
     */
    CONTACT_UNLOCKED = "CONTACT_UNLOCKED",
    /**
     * Négociation terminée
     * Le prix final a été fixé par le client et le worker
     */
    NEGOTIATION_DONE = "NEGOTIATION_DONE",
    /**
     * En attente du paiement final
     * Le prix final est supérieur au prix minimum, un paiement supplémentaire est requis
     */
    AWAITING_FINAL_PAYMENT = "AWAITING_FINAL_PAYMENT",
    /**
     * En cours
     * La mission est en cours d'exécution
     */
    IN_PROGRESS = "IN_PROGRESS",
    /**
     * Terminée
     * La mission a été complétée avec succès (double confirmation)
     */
    COMPLETED = "COMPLETED",
    /**
     * Annulation en cours
     * Une annulation a été demandée par le client ou le worker
     */
    CANCEL_REQUESTED = "CANCEL_REQUESTED",
    /**
     * Annulée
     * La mission a été annulée
     */
    CANCELLED = "CANCELLED",
    /**
     * Refusée
     * Le worker a refusé la mission
     */
    REFUSED = "REFUSED"
}
export declare const MISSION_STATUS_TRANSITIONS: Record<MissionStatus, MissionStatus[]>;
export type MissionStatusType = `${MissionStatus}`;
export type CancellationRequester = 'CLIENT' | 'WORKER';
//# sourceMappingURL=mission-status.enum.d.ts.map