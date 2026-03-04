/**
 * Événement émis lors de la création d'une mission
 */
export interface MissionCreatedEvent {
    type: 'MISSION_CREATED';
    payload: {
        missionId: string;
        clientId: string;
        workerId: string;
        serviceId: string;
        prixMin: number;
        prixMax: number;
        status: string;
        createdAt: Date;
    };
}
/**
 * Événement émis lors de la confirmation du paiement initial
 */
export interface InitialPaymentConfirmedEvent {
    type: 'INITIAL_PAYMENT_CONFIRMED';
    payload: {
        missionId: string;
        clientId: string;
        workerId: string;
        status: string;
        updatedAt: Date;
    };
}
/**
 * Événement émis lors de l'acceptation de la mission par le worker
 */
export interface MissionAcceptedEvent {
    type: 'MISSION_ACCEPTED';
    payload: {
        missionId: string;
        clientId: string;
        workerId: string;
        status: string;
        updatedAt: Date;
    };
}
/**
 * Événement émis lors du refus de la mission par le worker
 */
export interface MissionRefusedEvent {
    type: 'MISSION_REFUSED';
    payload: {
        missionId: string;
        clientId: string;
        workerId: string;
        status: string;
        updatedAt: Date;
    };
}
/**
 * Événement émis lors de la finalisation de la négociation
 */
export interface NegotiationFinalizedEvent {
    type: 'NEGOTIATION_FINALIZED';
    payload: {
        missionId: string;
        prixFinal: number;
        montantRestant: number;
        status: string;
        requiresFinalPayment: boolean;
        updatedAt: Date;
    };
}
/**
 * Événement émis lors de la confirmation du paiement final
 */
export interface FinalPaymentConfirmedEvent {
    type: 'FINAL_PAYMENT_CONFIRMED';
    payload: {
        missionId: string;
        prixFinal: number;
        status: string;
        updatedAt: Date;
    };
}
/**
 * Événement émis lors de la complétion de la mission (double confirmation)
 */
export interface MissionCompletedEvent {
    type: 'MISSION_COMPLETED';
    payload: {
        missionId: string;
        clientId: string;
        workerId: string;
        prixFinal: number;
        status: string;
        completedAt: Date;
    };
}
/**
 * Événement émis lors d'une demande d'annulation
 */
export interface CancellationRequestedEvent {
    type: 'CANCELLATION_REQUESTED';
    payload: {
        missionId: string;
        requestedBy: 'CLIENT' | 'WORKER';
        status: string;
        updatedAt: Date;
    };
}
/**
 * Événement émis lors de l'approbation de l'annulation
 */
export interface CancellationApprovedEvent {
    type: 'CANCELLATION_APPROVED';
    payload: {
        missionId: string;
        status: string;
        updatedAt: Date;
    };
}
/**
 * Événement émis lors du rejet de l'annulation
 */
export interface CancellationRejectedEvent {
    type: 'CANCELLATION_REJECTED';
    payload: {
        missionId: string;
        status: string;
        updatedAt: Date;
    };
}
/**
 * Union de tous les événements de mission
 */
export type MissionEvent = MissionCreatedEvent | InitialPaymentConfirmedEvent | MissionAcceptedEvent | MissionRefusedEvent | NegotiationFinalizedEvent | FinalPaymentConfirmedEvent | MissionCompletedEvent | CancellationRequestedEvent | CancellationApprovedEvent | CancellationRejectedEvent;
/**
 * Événements qui déclenchent une notification au worker
 */
export type WorkerNotificationEvent = MissionCreatedEvent | MissionAcceptedEvent | MissionRefusedEvent | CancellationRequestedEvent | CancellationApprovedEvent;
/**
 * Événements qui déclenchent une notification au client
 */
export type ClientNotificationEvent = MissionCreatedEvent | InitialPaymentConfirmedEvent | MissionAcceptedEvent | MissionRefusedEvent | NegotiationFinalizedEvent | FinalPaymentConfirmedEvent | MissionCompletedEvent | CancellationRequestedEvent | CancellationApprovedEvent | CancellationRejectedEvent;
//# sourceMappingURL=mission.events.d.ts.map