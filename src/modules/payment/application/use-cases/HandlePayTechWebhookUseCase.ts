// ============================================================================
// HANDLE PAYTECH WEBHOOK USE CASE - APPLICATION LAYER
// ============================================================================
// Traite les webhooks PayTech (IPN - Instant Payment Notification)
// Gère la vérification de signature et la mise à jour des statuts
// ============================================================================

import { BusinessErrors } from '../../../../shared/errors/business-error.js';
import { MissionStatus } from '../../../mission/domain/index.js';
import { PaymentStatus } from '../../domain/enums/PaymentStatus.js';
import type { IPaymentRepository } from '../payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../mission-repository.interface.js';
import type { PayTechService, PayTechWebhookPayload } from '../../infrastructure/paytech/PayTechService.js';
import { paytechWebhookSchema } from '../../interface/payment.validation.js';

/**
 * DTO pour le webhook
 */
export interface HandleWebhookInput {
  payload: PayTechWebhookPayload;
  signature: string;
  rawBody: string;
}

/**
 * DTO pour le résultat
 */
export interface HandleWebhookResult {
  success: boolean;
  paymentId: string;
  status: string;
  message: string;
}

/**
 * Handle PayTech Webhook Use Case
 * 
 * RESPONSABILITÉ:
 * - Vérifier la signature du webhook
 * - Valider l'idempotence (éviter les doublestraitements)
 * - Mettre à jour le Payment et l'Escrow selon le statut PayTech
 * - Transitioner le statut de la mission
 * 
 * SCÉNARIO:
 * 1. Vérifier la signature PayTech
 * 2. Trouver le payment par ref_command
 * 3. Vérifier l'idempotence (si déjà traité, ignorer)
 * 4. Selon le statut PayTech:
 *    - SUCCESS: Payment → SUCCESS, Escrow → HELD, Mission → PENDING_ACCEPT
 *    - FAILED: Payment → FAILED
 *    - PENDING: Garder en PENDING
 */
export class HandlePayTechWebhookUseCase {
  private readonly paymentRepository: IPaymentRepository;
  private readonly missionRepository: IMissionRepositoryForPayment;
  private readonly paytechService: PayTechService;

  constructor(
    paymentRepository: IPaymentRepository,
    missionRepository: IMissionRepositoryForPayment,
    paytechService: PayTechService
  ) {
    this.paymentRepository = paymentRepository;
    this.missionRepository = missionRepository;
    this.paytechService = paytechService;
  }

  /**
   * Exécute le traitement du webhook
   */
  async execute(input: HandleWebhookInput): Promise<HandleWebhookResult> {
    // 1. Valider le payload avec Zod
    const validationResult = paytechWebhookSchema.safeParse(input.payload);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((issue) => issue.message).join(', ');
      throw BusinessErrors.badRequest(`Payload webhook invalide: ${errorMessages}`);
    }

    // 2. Vérifier la signature
    const signatureVerification = this.paytechService.verifyWebhookSignature(
      input.rawBody,
      input.signature
    );

    if (!signatureVerification.isValid) {
      throw BusinessErrors.forbidden('Signature webhook invalide.');
    }

    // 3. Traiter le webhook
    const processed = this.paytechService.processWebhook(input.payload);

    // 3. Trouver le payment par ref_command
    const payment = await this.paymentRepository.findPaymentByIdempotencyKey(
      processed.refCommand
    );

    if (!payment) {
      throw BusinessErrors.notFound(
        `Paiement introuvable pour la référence: ${processed.refCommand}`
      );
    }

    // 4. Vérifier l'idempotence - ne pas traiter deux fois
    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.REFUNDED) {
      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        message: 'Webhook déjà traité (idempotence).',
      };
    }

    // 5. Récupérer l'escrow
    const escrow = await this.paymentRepository.findEscrowByPaymentId(payment.id);

    // 6. Mettre à jour selon le statut PayTech
    switch (processed.status) {
      case 'SUCCESS':
        return await this.handleSuccess(payment, escrow, processed.amount);
      
      case 'FAILED':
        return await this.handleFailure(payment);
      
      case 'PENDING':
        return {
          success: true,
          paymentId: payment.id,
          status: PaymentStatus.PENDING,
          message: 'Paiement en attente de confirmation.',
        };
      
      default:
        throw BusinessErrors.badRequest(`Statut PayTech inconnu: ${processed.status}`);
    }
  }

  /**
   * Gère le cas de succès du paiement
   */
  private async handleSuccess(
    payment: Awaited<ReturnType<IPaymentRepository['findPaymentById']>>,
    escrow: Awaited<ReturnType<IPaymentRepository['findEscrowByPaymentId']>>,
    _amount: number
  ): Promise<HandleWebhookResult> {
    if (!payment) {
      throw BusinessErrors.notFound('Paiement introuvable.');
    }

    // Mettre à jour le payment vers SUCCESS
    const updatedPayment = payment.markAsSuccess(`paytech-${Date.now()}`);

    // Si un escrow existe, le bloquer (HELD)
    if (escrow) {
      const heldEscrow = escrow.hold(`paytech-${Date.now()}`);
      await this.paymentRepository.updateAfterRelease(
        payment.id,
        escrow.id,
        updatedPayment,
        heldEscrow
      );
    } else {
      await this.paymentRepository.updatePayment(payment.id, updatedPayment);
    }

    // Transitioner la mission vers PENDING_ACCEPT
    await this.missionRepository.updateStatus(payment.missionId, MissionStatus.PENDING_ACCEPT);

    return {
      success: true,
      paymentId: payment.id,
      status: PaymentStatus.SUCCESS,
      message: 'Paiement confirmé. Mission en attente d\'acceptation.',
    };
  }

  /**
   * Gère le cas d'échec du paiement
   */
  private async handleFailure(
    payment: Awaited<ReturnType<IPaymentRepository['findPaymentById']>>
  ): Promise<HandleWebhookResult> {
    if (!payment) {
      throw BusinessErrors.notFound('Paiement introuvable.');
    }

    // Mettre à jour le payment vers FAILED
    const updatedPayment = payment.markAsFailed();
    await this.paymentRepository.updatePayment(payment.id, updatedPayment);

    return {
      success: true,
      paymentId: payment.id,
      status: PaymentStatus.FAILED,
      message: 'Paiement échoué.',
    };
  }
}
