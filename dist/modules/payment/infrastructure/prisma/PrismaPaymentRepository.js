// ============================================================================
// PRISMA PAYMENT REPOSITORY - INFRASTRUCTURE LAYER
// ============================================================================
// Implémentation Prisma du repository de paiements
// ============================================================================
import { Prisma, PrismaClient, PaymentStatus, EscrowStatus } from '@prisma/client';
import { Payment } from '../../domain/entities/Payment.js';
import { Escrow } from '../../domain/entities/Escrow.js';
const prisma = new PrismaClient();
/**
 * Convertit un statut Prisma en type domaine
 */
function toPaymentStatus(status) {
    return status;
}
function toEscrowStatus(status) {
    return status;
}
/**
 * Convertit le metadata pour Prisma (gère les types JSON)
 */
function toPrismaJsonValue(metadata) {
    if (metadata === null || metadata === undefined) {
        return Prisma.JsonNull;
    }
    return metadata;
}
/**
 * Convertit un enregistrement Prisma en entité Payment
 */
function toPaymentEntity(record) {
    if (!record)
        return null;
    const props = {
        id: record.id,
        missionId: record.missionId,
        clientId: record.clientId,
        workerId: record.workerId,
        amount: Number(record.amount),
        currency: record.currency,
        status: toPaymentStatus(record.status),
        paymentMethod: record.paymentMethod,
        paytechRef: record.paytechRef,
        idempotencyKey: record.idempotencyKey,
        metadata: record.metadata,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
    return new Payment(props);
}
/**
 * Convertit un enregistrement Prisma en entité Escrow
 */
function toEscrowEntity(record) {
    if (!record)
        return null;
    const props = {
        id: record.id,
        paymentId: record.paymentId,
        missionId: record.missionId,
        amount: Number(record.amount),
        workerAmount: Number(record.workerAmount),
        commissionAmount: Number(record.commissionAmount),
        status: toEscrowStatus(record.status),
        releaseType: record.releaseType,
        paytechRef: record.paytechRef,
        // Traçabilité
        releasedBy: record.releasedBy,
        releaseReason: record.releaseReason,
        // Optimistic locking
        version: record.version,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        releasedAt: record.releasedAt,
    };
    return new Escrow(props);
}
/**
 * Prisma Payment Repository
 *
 * RESPONSABILITÉS:
 * - Implémenter l'interface IPaymentRepository
 * - Gérer la persistance des Payments et Escrows via Prisma
 * - Gérer les transactions
 */
export class PrismaPaymentRepository {
    prisma;
    constructor(prismaClient) {
        this.prisma = prismaClient || prisma;
    }
    // ==================== PAYMENT OPERATIONS ====================
    async findPaymentById(id) {
        const record = await this.prisma.payment.findUnique({
            where: { id },
        });
        return toPaymentEntity(record);
    }
    async findPaymentByIdempotencyKey(key) {
        const record = await this.prisma.payment.findUnique({
            where: { idempotencyKey: key },
        });
        return toPaymentEntity(record);
    }
    async findPaymentByMissionId(missionId) {
        const record = await this.prisma.payment.findFirst({
            where: { missionId },
            orderBy: { createdAt: 'desc' },
        });
        return toPaymentEntity(record);
    }
    async findPaymentByPaytechRef(ref) {
        const record = await this.prisma.payment.findFirst({
            where: { paytechRef: ref },
        });
        return toPaymentEntity(record);
    }
    async createPayment(input) {
        const record = await this.prisma.payment.create({
            data: {
                missionId: input.missionId,
                clientId: input.clientId,
                workerId: input.workerId,
                amount: input.amount,
                currency: input.currency || 'XOF',
                status: PaymentStatus.PENDING,
                idempotencyKey: input.idempotencyKey,
                metadata: toPrismaJsonValue(input.metadata),
            },
        });
        return toPaymentEntity(record);
    }
    async updatePayment(id, payment) {
        const record = await this.prisma.payment.update({
            where: { id },
            data: {
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                paytechRef: payment.paytechRef,
                metadata: toPrismaJsonValue(payment.metadata),
                updatedAt: new Date(),
            },
        });
        return toPaymentEntity(record);
    }
    // ==================== ESCROW OPERATIONS ====================
    async findEscrowById(id) {
        const record = await this.prisma.escrow.findUnique({
            where: { id },
        });
        return toEscrowEntity(record);
    }
    async findEscrowByMissionId(missionId) {
        const record = await this.prisma.escrow.findUnique({
            where: { missionId },
        });
        return toEscrowEntity(record);
    }
    async findEscrowByPaymentId(paymentId) {
        const record = await this.prisma.escrow.findUnique({
            where: { paymentId },
        });
        return toEscrowEntity(record);
    }
    async createEscrow(input) {
        const record = await this.prisma.escrow.create({
            data: {
                paymentId: input.paymentId,
                missionId: input.missionId,
                amount: input.amount,
                workerAmount: input.workerAmount,
                commissionAmount: input.commissionAmount,
                status: input.status,
            },
        });
        return toEscrowEntity(record);
    }
    async updateEscrow(id, escrow, expectedVersion) {
        // Optimistic locking: vérifier la version si fournie
        if (expectedVersion !== undefined) {
            const currentEscrow = await this.prisma.escrow.findUnique({ where: { id } });
            if (!currentEscrow) {
                throw new Error('Escrow introuvable');
            }
            if (currentEscrow.version !== expectedVersion) {
                throw new Error(`Conflit de version: la version attendue est ${expectedVersion} mais la version actuelle est ${currentEscrow.version}. L'escrow a été modifié par une autre transaction.`);
            }
        }
        const record = await this.prisma.escrow.update({
            where: { id },
            data: {
                status: escrow.status,
                workerAmount: escrow.workerAmount,
                commissionAmount: escrow.commissionAmount,
                releaseType: escrow.releaseType,
                paytechRef: escrow.paytechRef,
                releasedAt: escrow.releasedAt,
                releasedBy: escrow.releasedBy,
                releaseReason: escrow.releaseReason,
                version: { increment: 1 },
                updatedAt: new Date(),
            },
        });
        return toEscrowEntity(record);
    }
    // ==================== TRANSACTION OPERATIONS ====================
    async savePaymentWithEscrow(payment, escrow) {
        const result = await this.prisma.$transaction(async (tx) => {
            // Créer le payment
            const paymentRecord = await tx.payment.create({
                data: {
                    id: payment.id,
                    missionId: payment.missionId,
                    clientId: payment.clientId,
                    workerId: payment.workerId,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    idempotencyKey: payment.idempotencyKey,
                    metadata: toPrismaJsonValue(payment.metadata),
                },
            });
            // Créer l'escrow
            const escrowRecord = await tx.escrow.create({
                data: {
                    id: escrow.id,
                    paymentId: escrow.paymentId,
                    missionId: escrow.missionId,
                    amount: escrow.amount,
                    workerAmount: escrow.workerAmount,
                    commissionAmount: escrow.commissionAmount,
                    status: escrow.status,
                    version: 0,
                },
            });
            return { payment: paymentRecord, escrow: escrowRecord };
        });
        return {
            payment: toPaymentEntity(result.payment),
            escrow: toEscrowEntity(result.escrow),
        };
    }
    async updateAfterRelease(paymentId, escrowId, payment, escrow, expectedVersion) {
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: payment.status,
                    paytechRef: payment.paytechRef,
                    updatedAt: new Date(),
                },
            });
            // Build update data for escrow
            const escrowUpdateData = {
                status: escrow.status,
                workerAmount: escrow.workerAmount,
                commissionAmount: escrow.commissionAmount,
                releaseType: escrow.releaseType,
                paytechRef: escrow.paytechRef,
                releasedAt: escrow.releasedAt,
                releasedBy: escrow.releasedBy,
                releaseReason: escrow.releaseReason,
                version: { increment: 1 },
                updatedAt: new Date(),
            };
            // Optimistic locking: inclure la version si fournie
            if (expectedVersion !== undefined) {
                await tx.escrow.update({
                    where: {
                        id: escrowId,
                        version: expectedVersion, // Cette condition确保原子性
                    },
                    data: escrowUpdateData,
                });
            }
            else {
                await tx.escrow.update({
                    where: { id: escrowId },
                    data: escrowUpdateData,
                });
            }
        });
    }
    async updateAfterRefund(paymentId, escrowId, payment, escrow, expectedVersion) {
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: payment.status,
                    updatedAt: new Date(),
                },
            });
            // Build update data for escrow
            const escrowUpdateData = {
                status: escrow.status,
                workerAmount: escrow.workerAmount,
                commissionAmount: escrow.commissionAmount,
                releaseType: escrow.releaseType,
                paytechRef: escrow.paytechRef,
                releasedAt: escrow.releasedAt,
                releasedBy: escrow.releasedBy,
                releaseReason: escrow.releaseReason,
                version: { increment: 1 },
                updatedAt: new Date(),
            };
            // Optimistic locking: inclure la version si fournie
            if (expectedVersion !== undefined) {
                await tx.escrow.update({
                    where: {
                        id: escrowId,
                        version: expectedVersion,
                    },
                    data: escrowUpdateData,
                });
            }
            else {
                await tx.escrow.update({
                    where: { id: escrowId },
                    data: escrowUpdateData,
                });
            }
        });
    }
}
// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
export const paymentRepository = new PrismaPaymentRepository();
//# sourceMappingURL=PrismaPaymentRepository.js.map