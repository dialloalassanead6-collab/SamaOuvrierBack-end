// ============================================================================
// PAYMENT CONTROLLER - INTERFACE LAYER
// ============================================================================
// Gère les requêtes HTTP pour les paiements
// Orchestre les use cases - pas de logique métier ici
// ============================================================================
import { createPaymentSchema, releaseEscrowSchema, cancelPaymentSchema, } from './payment.validation.js';
/**
 * Payment Controller
 *
 * RESPONSABILITÉS:
 * - Valider les requêtes entrantes
 * - Appeler les use cases appropriés
 * - Renvoyer les réponses HTTP
 * - Gérer les erreurs
 */
export class PaymentController {
    createPaymentUseCase;
    releaseEscrowUseCase;
    cancelMissionPaymentUseCase;
    handlePayTechWebhookUseCase;
    paymentRepository;
    constructor(createPaymentUseCase, releaseEscrowUseCase, cancelMissionPaymentUseCase, handlePayTechWebhookUseCase, paymentRepository) {
        this.createPaymentUseCase = createPaymentUseCase;
        this.releaseEscrowUseCase = releaseEscrowUseCase;
        this.cancelMissionPaymentUseCase = cancelMissionPaymentUseCase;
        this.handlePayTechWebhookUseCase = handlePayTechWebhookUseCase;
        this.paymentRepository = paymentRepository;
    }
    /**
     * POST /payments
     * Crée un nouveau paiement pour une mission
     */
    async createPayment(req, res, next) {
        try {
            // Valider la requête
            const validatedData = createPaymentSchema.parse(req.body);
            // Extraire l'ID de l'utilisateur depuis le token JWT
            const userId = req.user?.sub;
            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }
            // Appeler le use case
            const result = await this.createPaymentUseCase.execute({
                missionId: validatedData.missionId,
                clientId: userId,
            });
            // Renvoyer la réponse
            res.status(201).json({
                success: true,
                data: {
                    paymentId: result.paymentId,
                    escrowId: result.escrowId,
                    paymentUrl: result.paymentUrl,
                    amount: result.amount,
                },
                message: 'Paiement initialisé. Veuillez compléter le paiement via PayTech.',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /payments/:missionId/release
     * Libère l'escrow après double confirmation
     */
    async releaseEscrow(req, res, next) {
        try {
            // Valider la requête
            const validatedData = releaseEscrowSchema.parse({
                missionId: req.params.missionId,
            });
            // Extraire l'ID de l'utilisateur depuis le token JWT
            const userId = req.user?.sub;
            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }
            // Utiliser le rôle déterminé par le middleware verifyMissionOwnership
            // pour éviter qu'un utilisateur malveillant ne puisse usurper un rôle
            const role = req.body.missionUserRole;
            if (!role) {
                res.status(403).json({ error: 'Rôle non déterminé' });
                return;
            }
            // Appeler le use case
            const result = await this.releaseEscrowUseCase.execute({
                missionId: validatedData.missionId,
                userId,
                role,
            });
            // Renvoyer la réponse
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /payments/:missionId/cancel
     * Annule le paiement et traite le remboursement
     */
    async cancelPayment(req, res, next) {
        try {
            // Valider la requête
            const validatedData = cancelPaymentSchema.parse({
                missionId: req.params.missionId,
                cancellationType: req.body.cancellationType || 'DIRECT',
            });
            // Extraire l'ID de l'utilisateur depuis le token JWT
            const userId = req.user?.sub;
            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }
            // Utiliser le rôle déterminé par le middleware verifyMissionOwnership
            // pour éviter qu'un utilisateur malveillant ne puisse usurper un rôle
            const role = req.body.missionUserRole;
            if (!role) {
                res.status(403).json({ error: 'Rôle non déterminé' });
                return;
            }
            // Appeler le use case
            const result = await this.cancelMissionPaymentUseCase.execute({
                missionId: validatedData.missionId,
                userId,
                role,
                cancellationType: validatedData.cancellationType,
            });
            // Renvoyer la réponse
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /payments/callback
     * Webhook PayTech pour les notifications de paiement
     */
    async handleWebhook(req, res, next) {
        try {
            // Extraire la signature des headers
            const signature = req.headers['x-paytech-signature'];
            if (!signature) {
                res.status(400).json({ error: 'Signature manquante' });
                return;
            }
            // Appeler le use case
            const result = await this.handlePayTechWebhookUseCase.execute({
                payload: req.body,
                signature,
                rawBody: JSON.stringify(req.body),
            });
            // Renvoyer la réponse
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /payments/:missionId
     * Récupère le statut du paiement d'une mission
     */
    async getPaymentStatus(req, res, next) {
        try {
            const missionId = req.params.missionId;
            if (!missionId || Array.isArray(missionId)) {
                res.status(400).json({ error: 'ID de mission manquant' });
                return;
            }
            // Récupérer le payment et l'escrow pour cette mission
            const payment = await this.paymentRepository.findPaymentByMissionId(missionId);
            const escrow = payment ? await this.paymentRepository.findEscrowByPaymentId(payment.id) : null;
            if (!payment) {
                res.status(404).json({ error: 'Paiement introuvable pour cette mission' });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Statut du paiement',
                data: {
                    missionId: payment.missionId,
                    paymentId: payment.id,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    paytechRef: payment.paytechRef,
                    escrow: escrow ? {
                        id: escrow.id,
                        amount: escrow.amount,
                        workerAmount: escrow.workerAmount,
                        commissionAmount: escrow.commissionAmount,
                        status: escrow.status,
                        releasedAt: escrow.releasedAt,
                    } : null,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=PaymentController.js.map