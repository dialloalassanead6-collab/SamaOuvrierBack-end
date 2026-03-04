import type { Request, Response, NextFunction } from 'express';
import type { CreatePaymentUseCase } from '../application/use-cases/CreatePaymentUseCase.js';
import type { ReleaseEscrowUseCase } from '../application/use-cases/ReleaseEscrowUseCase.js';
import type { CancelMissionPaymentUseCase } from '../application/use-cases/CancelMissionPaymentUseCase.js';
import type { HandlePayTechWebhookUseCase } from '../application/use-cases/HandlePayTechWebhookUseCase.js';
import type { IPaymentRepository } from '../application/payment.repository.interface.js';
/**
 * Payment Controller
 *
 * RESPONSABILITÉS:
 * - Valider les requêtes entrantes
 * - Appeler les use cases appropriés
 * - Renvoyer les réponses HTTP
 * - Gérer les erreurs
 */
export declare class PaymentController {
    private readonly createPaymentUseCase;
    private readonly releaseEscrowUseCase;
    private readonly cancelMissionPaymentUseCase;
    private readonly handlePayTechWebhookUseCase;
    private readonly paymentRepository;
    constructor(createPaymentUseCase: CreatePaymentUseCase, releaseEscrowUseCase: ReleaseEscrowUseCase, cancelMissionPaymentUseCase: CancelMissionPaymentUseCase, handlePayTechWebhookUseCase: HandlePayTechWebhookUseCase, paymentRepository: IPaymentRepository);
    /**
     * POST /payments
     * Crée un nouveau paiement pour une mission
     */
    createPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /payments/:missionId/release
     * Libère l'escrow après double confirmation
     */
    releaseEscrow(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /payments/:missionId/cancel
     * Annule le paiement et traite le remboursement
     */
    cancelPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /payments/callback
     * Webhook PayTech pour les notifications de paiement
     */
    handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /payments/:missionId
     * Récupère le statut du paiement d'une mission
     */
    getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=PaymentController.d.ts.map