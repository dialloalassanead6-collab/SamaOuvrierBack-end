// ============================================================================
// PAYMENT MODULE - EXPORT INDEX
// ============================================================================
// Point d'entrée principal du module Payment
// ============================================================================

// Domain exports
export * from './domain/index.js';

// Application exports - Use Cases
export { CreatePaymentUseCase } from './application/use-cases/CreatePaymentUseCase.js';
export { ReleaseEscrowUseCase } from './application/use-cases/ReleaseEscrowUseCase.js';
export { CancelMissionPaymentUseCase } from './application/use-cases/CancelMissionPaymentUseCase.js';
export { HandlePayTechWebhookUseCase } from './application/use-cases/HandlePayTechWebhookUseCase.js';

// Application exports - Interfaces
export type { IPaymentRepository } from './application/payment.repository.interface.js';
export type { IMissionRepositoryForPayment } from './application/mission-repository.interface.js';

// Infrastructure exports
export { PayTechService, createPayTechService } from './infrastructure/paytech/PayTechService.js';
export { PrismaPaymentRepository, paymentRepository } from './infrastructure/prisma/PrismaPaymentRepository.js';

// Interface exports
export { PaymentController } from './interface/PaymentController.js';
export { createPaymentRoutes } from './interface/payment.routes.js';
export * from './interface/payment.validation.js';
