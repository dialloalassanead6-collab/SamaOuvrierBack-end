// ============================================================================
// PAYMENT DOMAIN - EXPORT INDEX
// ============================================================================
// Export de toutes les entités, value objects, enums et services du domaine
// ============================================================================

// Enums
export { PaymentStatus, type PaymentStatusType } from './enums/PaymentStatus.js';
export { EscrowStatus, type EscrowStatusType } from './enums/EscrowStatus.js';

// Entities
export { Payment, type PaymentProps, type PaymentWithDetails } from './entities/Payment.js';
export { Escrow, type EscrowProps, type EscrowWithDetails } from './entities/Escrow.js';

// Value Objects
export { Money, type MoneyProps } from './value-objects/Money.js';

// Domain Services
export {
  EscrowDomainService,
  type EscrowConfig,
  type ReleaseFundsResult,
  type PartialRefundResult,
} from './services/EscrowDomainService.js';
