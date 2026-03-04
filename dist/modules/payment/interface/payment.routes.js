// ============================================================================
// PAYMENT ROUTES - INTERFACE LAYER
// ============================================================================
// Définit les routes HTTP pour les paiements
// ============================================================================
import { Router } from 'express';
import { authenticate, verifyMissionOwnership } from '../../../shared/middleware/index.js';
/**
 * Crée les routes de paiement
 */
export function createPaymentRoutes(controller) {
    const router = Router();
    // ====================
    // ROUTES PUBLIQUES
    // ====================
    // Webhook PayTech (IPN) - Pas d'authentification requise
    router.post('/callback', controller.handleWebhook.bind(controller));
    // ====================
    // ROUTES PROTÉGÉES
    // ====================
    // Appliquer l'authentification
    router.use(authenticate());
    // Créer un paiement
    router.post('/', controller.createPayment.bind(controller));
    // Libérer l'escrow - nécessite d'être client ou worker de la mission
    router.post('/:missionId/release', verifyMissionOwnership({ requireOwnership: true }), controller.releaseEscrow.bind(controller));
    // Annuler le paiement - nécessite d'être client ou worker de la mission
    router.post('/:missionId/cancel', verifyMissionOwnership({ requireOwnership: true }), controller.cancelPayment.bind(controller));
    // Récupérer le statut du paiement - nécessite d'être client ou worker de la mission
    router.get('/:missionId', verifyMissionOwnership({ requireOwnership: true }), controller.getPaymentStatus.bind(controller));
    return router;
}
//# sourceMappingURL=payment.routes.js.map