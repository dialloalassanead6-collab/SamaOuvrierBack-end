/**
 * ============================================================================
 * DOMAIN LAYER - Notification Entity
 * ============================================================================
 * Ce fichier définit l'entité Notification qui représente une notification
 * dans le système SamaOuvrier.
 *
 * Cette entité est la représentation centrale de la notification dans le
 * domain model. Elle est indépendante de tout framework ou base de données.
 *
 * @domain Entité principale du module Notification
 * @responsibilities Représenter une notification dans le système
 * ============================================================================
 */
/**
 * Type de notification disponible dans le système
 *
 * Ces types couvrent tous les événements qui peuvent déclencher une notification :
 * - Compte utilisateur : création, validation, rejet
 * - Missions : création, acceptation, refus, termination, annulation
 * - Paiements : réception, libération, remboursement
 * - Disputes : ouverture, mise à jour, résolution
 * - Reviews : nouvel avis reçu
 * - Système : notifications système générales
 */
export var NotificationType;
(function (NotificationType) {
    // === COMPTE UTILISATEUR ===
    /** Notification lors de la création d'un compte */
    NotificationType["ACCOUNT_CREATED"] = "ACCOUNT_CREATED";
    /** Notification lorsqu'un compte worker est en attente de validation */
    NotificationType["ACCOUNT_PENDING_APPROVAL"] = "ACCOUNT_PENDING_APPROVAL";
    /** Notification lorsqu'un compte a été validé par un administrateur */
    NotificationType["ACCOUNT_APPROVED"] = "ACCOUNT_APPROVED";
    /** Notification lorsqu'un compte a été rejeté */
    NotificationType["ACCOUNT_REJECTED"] = "ACCOUNT_REJECTED";
    // === MISSIONS ===
    /** Notification lorsqu'une nouvelle mission est créée */
    NotificationType["MISSION_CREATED"] = "MISSION_CREATED";
    /** Notification lorsqu'une mission a été acceptée par un worker */
    NotificationType["MISSION_ACCEPTED"] = "MISSION_ACCEPTED";
    /** Notification lorsqu'une mission a été refusée par un worker */
    NotificationType["MISSION_REFUSED"] = "MISSION_REFUSED";
    /** Notification lorsqu'une mission est terminée */
    NotificationType["MISSION_COMPLETED"] = "MISSION_COMPLETED";
    /** Notification lorsqu'une mission est annulée */
    NotificationType["MISSION_CANCELLED"] = "MISSION_CANCELLED";
    // === PAIEMENTS ===
    /** Notification lorsqu'un paiement a été reçu */
    NotificationType["PAYMENT_RECEIVED"] = "PAYMENT_RECEIVED";
    /** Notification lorsqu'un paiement a été libéré (au worker) */
    NotificationType["PAYMENT_RELEASED"] = "PAYMENT_RELEASED";
    /** Notification lorsqu'un paiement a été remboursé */
    NotificationType["PAYMENT_REFUNDED"] = "PAYMENT_REFUNDED";
    // === DISPUTES ===
    /** Notification lorsqu'une dispute est ouverte */
    NotificationType["DISPUTE_OPENED"] = "DISPUTE_OPENED";
    /** Notification lors d'une mise à jour du statut d'une dispute */
    NotificationType["DISPUTE_STATUS_UPDATED"] = "DISPUTE_STATUS_UPDATED";
    /** Notification lorsqu'une dispute est résolue */
    NotificationType["DISPUTE_RESOLVED"] = "DISPUTE_RESOLVED";
    // === REVIEWS ===
    /** Notification lorsqu'un nouvel avis est reçu */
    NotificationType["REVIEW_RECEIVED"] = "REVIEW_RECEIVED";
    // === SYSTÈME ===
    /** Notification système générale */
    NotificationType["SYSTEM_NOTIFICATION"] = "SYSTEM_NOTIFICATION";
})(NotificationType || (NotificationType = {}));
/**
 * Statut de lecture de la notification
 *
 * Permet de suivre si l'utilisateur a lu ou non la notification.
 * Utile pour l'interface utilisateur (affichage du badge de notifications non lues).
 */
export var NotificationStatus;
(function (NotificationStatus) {
    /** Notification non lue par l'utilisateur */
    NotificationStatus["UNREAD"] = "UNREAD";
    /** Notification lue par l'utilisateur */
    NotificationStatus["READ"] = "READ";
})(NotificationStatus || (NotificationStatus = {}));
//# sourceMappingURL=notification.entity.js.map