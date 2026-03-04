import { PrismaClient } from '@prisma/client';
import { Payment } from '../../domain/entities/Payment.js';
import { Escrow } from '../../domain/entities/Escrow.js';
import type { IPaymentRepository, CreatePaymentInput, CreateEscrowInput } from '../../application/payment.repository.interface.js';
/**
 * Prisma Payment Repository
 *
 * RESPONSABILITÉS:
 * - Implémenter l'interface IPaymentRepository
 * - Gérer la persistance des Payments et Escrows via Prisma
 * - Gérer les transactions
 */
export declare class PrismaPaymentRepository implements IPaymentRepository {
    private readonly prisma;
    constructor(prismaClient?: PrismaClient);
    findPaymentById(id: string): Promise<Payment | null>;
    findPaymentByIdempotencyKey(key: string): Promise<Payment | null>;
    findPaymentByMissionId(missionId: string): Promise<Payment | null>;
    findPaymentByPaytechRef(ref: string): Promise<Payment | null>;
    createPayment(input: CreatePaymentInput): Promise<Payment>;
    updatePayment(id: string, payment: Payment): Promise<Payment>;
    findEscrowById(id: string): Promise<Escrow | null>;
    findEscrowByMissionId(missionId: string): Promise<Escrow | null>;
    findEscrowByPaymentId(paymentId: string): Promise<Escrow | null>;
    createEscrow(input: CreateEscrowInput): Promise<Escrow>;
    updateEscrow(id: string, escrow: Escrow, expectedVersion?: number): Promise<Escrow>;
    savePaymentWithEscrow(payment: Payment, escrow: Escrow): Promise<{
        payment: Payment;
        escrow: Escrow;
    }>;
    updateAfterRelease(paymentId: string, escrowId: string, payment: Payment, escrow: Escrow, expectedVersion?: number): Promise<void>;
    updateAfterRefund(paymentId: string, escrowId: string, payment: Payment, escrow: Escrow, expectedVersion?: number): Promise<void>;
}
export declare const paymentRepository: PrismaPaymentRepository;
//# sourceMappingURL=PrismaPaymentRepository.d.ts.map