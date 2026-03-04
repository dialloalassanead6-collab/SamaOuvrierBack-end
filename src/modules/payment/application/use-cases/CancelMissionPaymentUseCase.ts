// ============================================================================
// CANCEL MISSION PAYMENT USE CASE - APPLICATION LAYER
// ============================================================================
// Annule le paiement d'une mission en cours avec gestion du remboursement
// Scénarios: - Client annule → 70% client, 30% worker
//            - Worker annule → 100% client
// ============================================================================

import { BusinessErrors } from '../../../../shared/errors/business-error.js';
import { MissionStatus } from '../../../mission/domain/index.js';
import { EscrowStatus } from '../../domain/enums/EscrowStatus.js';
import { EscrowDomainService } from '../../domain/services/EscrowDomainService.js';
import type { IPaymentRepository } from '../payment.repository.interface.js';
import type { IMissionRepositoryForPayment } from '../mission-repository.interface.js';
import type { PayTechService } from '../../infrastructure/paytech/PayTechService.js';

/**
 * DTO pour annuler le paiement
 */
export interface CancelMissionPaymentInput {
  missionId: string;
  userId: string;
  role: 'CLIENT' | 'WORKER';
  cancellationType: 'DIRECT' | 'REQUESTED';
}

/**
 * DTO pour le résultat
 */
export interface CancelMissionPaymentResult {
  success: boolean;
  escrowStatus: string;
  clientRefundAmount: number;
  workerAmount: number;
  commissionAmount: number;
  message: string;
}

/**
 * Cancel Mission Payment Use Case
 * 
 * RESPONSABILITÉ:
 * - Gérer l'annulation du paiement d'une mission
 * - Calculer les montants de remboursement selon le demandeur
 * - Mettre à jour les statuts Payment, Escrow et Mission
 * 
 * SCÉNARIOS:
 * 1. Client annule en IN_PROGRESS: 70% client, 30% worker
 * 2. Worker annule en IN_PROGRESS: 100% client
 * 3. Worker refuse en PENDING_ACCEPT: 100% client (refund complet)
 */
export class CancelMissionPaymentUseCase {
  private readonly paymentRepository: IPaymentRepository;
  private readonly missionRepository: IMissionRepositoryForPayment;
  private readonly escrowDomainService: EscrowDomainService;

  constructor(
    paymentRepository: IPaymentRepository,
    missionRepository: IMissionRepositoryForPayment,
    _paytechService: PayTechService,
    escrowDomainService: EscrowDomainService
  ) {
    this.paymentRepository = paymentRepository;
    this.missionRepository = missionRepository;
    this.escrowDomainService = escrowDomainService;
  }

  /**
   * Exécute l'annulation du paiement
   */
  async execute(input: CancelMissionPaymentInput): Promise<CancelMissionPaymentResult> {
    // 1. Vérifier que la mission existe
    const mission = await this.missionRepository.findById(input.missionId);
    
    if (!mission) {
      throw BusinessErrors.notFound('Mission introuvable.');
    }

    // 2. Vérifier le statut de la mission
    const validCancelStatuses = [
      MissionStatus.IN_PROGRESS,
      MissionStatus.PENDING_ACCEPT,
      MissionStatus.CONTACT_UNLOCKED,
      MissionStatus.NEGOTIATION_DONE,
    ] as string[];

    if (!validCancelStatuses.includes(mission.status)) {
      throw BusinessErrors.badRequest(
        `La mission ne peut pas être annulée. Statut actuel: ${mission.status}`
      );
    }

    // 3. Vérifier les droits de l'utilisateur
    if (input.role === 'CLIENT' && mission.clientId !== input.userId) {
      throw BusinessErrors.forbidden('Vous n\'êtes pas le client de cette mission.');
    }
    if (input.role === 'WORKER' && mission.workerId !== input.userId) {
      throw BusinessErrors.forbidden('Vous n\'êtes pas le worker de cette mission.');
    }

    // 4. Cas spécial: Worker refuse en PENDING_ACCEPT (refund complet)
    if (mission.status === MissionStatus.PENDING_ACCEPT && input.role === 'WORKER') {
      return this.handleWorkerRefuse(input);
    }

    // 5. Cas: Annulation en IN_PROGRESS (remboursement partiel)
    if (mission.status === MissionStatus.IN_PROGRESS) {
      return this.handleInProgressCancellation(input);
    }

    // 6. Cas: Annulation avant IN_PROGRESS (remboursement complet)
    return this.handlePreInProgressCancellation(input);
  }

  /**
   * Gère le cas où le worker refuse la mission (PENDING_ACCEPT)
   */
  private async handleWorkerRefuse(input: CancelMissionPaymentInput): Promise<CancelMissionPaymentResult> {
    // Récupérer l'escrow
    const escrow = await this.paymentRepository.findEscrowByMissionId(input.missionId);
    const payment = await this.paymentRepository.findPaymentByMissionId(input.missionId);

    if (!escrow || !payment) {
      throw BusinessErrors.notFound('Escrow ou paiement introuvable.');
    }

    // Effectuer le remboursement complet
    const refundedEscrow = this.escrowDomainService.fullRefund(escrow);
    const updatedPayment = this.escrowDomainService.markPaymentRefunded(payment);

    // Sauvegarder
    await this.paymentRepository.updateAfterRefund(
      payment.id,
      escrow.id,
      updatedPayment,
      refundedEscrow
    );

    // Mettre à jour le statut de la mission vers REFUSED
    await this.missionRepository.updateStatus(input.missionId, MissionStatus.REFUSED);

    return {
      success: true,
      escrowStatus: refundedEscrow.status,
      clientRefundAmount: escrow.amount,
      workerAmount: 0,
      commissionAmount: 0,
      message: 'Mission refusée. Remboursement complet effectué.',
    };
  }

  /**
   * Gère l'annulation en cours (IN_PROGRESS)
   */
  private async handleInProgressCancellation(input: CancelMissionPaymentInput): Promise<CancelMissionPaymentResult> {
    // Récupérer l'escrow
    const escrow = await this.paymentRepository.findEscrowByMissionId(input.missionId);
    const payment = await this.paymentRepository.findPaymentByMissionId(input.missionId);

    if (!escrow || !payment) {
      throw BusinessErrors.notFound('Escrow ou paiement introuvable.');
    }

    if (escrow.status !== EscrowStatus.HELD) {
      throw BusinessErrors.badRequest(
        `L'escrow ne peut pas être annulé. Statut actuel: ${escrow.status}`
      );
    }

    // Calculer le remboursement selon qui annule
    let clientRefundAmount: number;
    let workerAmount: number;
    let commissionAmount: number;
    let escrowStatus: string;

    if (input.role === 'CLIENT') {
      // Client annule: 70% client, 30% worker
      const result = this.escrowDomainService.partialRefund(escrow, 'CLIENT');
      clientRefundAmount = result.clientAmount;
      workerAmount = result.workerAmount;
      commissionAmount = 0; // La commission est perdue
      escrowStatus = result.escrow.status;
    } else {
      // Worker annule: 100% client
      const result = this.escrowDomainService.partialRefund(escrow, 'WORKER');
      clientRefundAmount = result.clientAmount;
      workerAmount = result.workerAmount;
      commissionAmount = 0;
      escrowStatus = result.escrow.status;
    }

    // Mettre à jour le payment vers REFUNDED
    const updatedPayment = this.escrowDomainService.markPaymentRefunded(payment);

    // Sauvegarder
    await this.paymentRepository.updateAfterRefund(
      payment.id,
      escrow.id,
      updatedPayment,
      escrow
    );

    // Mettre à jour le statut de la mission vers CANCELLED
    await this.missionRepository.updateStatus(input.missionId, MissionStatus.CANCELLED);

    return {
      success: true,
      escrowStatus,
      clientRefundAmount,
      workerAmount,
      commissionAmount,
      message: input.role === 'CLIENT'
        ? 'Mission annulée. 70% remboursé au client, 30% au worker.'
        : 'Mission annulée. Remboursement complet au client.',
    };
  }

  /**
   * Gère l'annulation avant IN_PROGRESS (remboursement complet)
   */
  private async handlePreInProgressCancellation(input: CancelMissionPaymentInput): Promise<CancelMissionPaymentResult> {
    // Récupérer l'escrow
    const escrow = await this.paymentRepository.findEscrowByMissionId(input.missionId);
    const payment = await this.paymentRepository.findPaymentByMissionId(input.missionId);

    // Si pas d'escrow, juste annuler la mission
    if (!escrow || !payment) {
      await this.missionRepository.updateStatus(input.missionId, MissionStatus.CANCELLED);
      return {
        success: true,
        escrowStatus: 'N/A',
        clientRefundAmount: 0,
        workerAmount: 0,
        commissionAmount: 0,
        message: 'Mission annulée.',
      };
    }

    // Effectuer le remboursement complet
    const refundedEscrow = this.escrowDomainService.fullRefund(escrow);
    const updatedPayment = this.escrowDomainService.markPaymentRefunded(payment);

    // Sauvegarder
    await this.paymentRepository.updateAfterRefund(
      payment.id,
      escrow.id,
      updatedPayment,
      refundedEscrow
    );

    // Mettre à jour le statut de la mission vers CANCELLED
    await this.missionRepository.updateStatus(input.missionId, MissionStatus.CANCELLED);

    return {
      success: true,
      escrowStatus: refundedEscrow.status,
      clientRefundAmount: escrow.amount,
      workerAmount: 0,
      commissionAmount: 0,
      message: 'Mission annulée. Remboursement complet effectué.',
    };
  }
}
