// ============================================================================
// DISPUTE MODULE - Main Index
// ============================================================================
// Exports all public interfaces of the Dispute module
// ============================================================================
// Domain Layer
export * from './domain/index.js';
// Application Layer - Use Cases
export { CreateDisputeUseCase, GetDisputesUseCase, ResolveDisputeUseCase, AddEvidenceUseCase, } from './application/use-cases/index.js';
// Infrastructure Layer
export * from './infrastructure/index.js';
// Routes
import disputeRoutes from './interface/dispute.routes.js';
export { disputeRoutes };
//# sourceMappingURL=index.js.map