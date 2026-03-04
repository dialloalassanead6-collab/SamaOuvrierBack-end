// App - Express Application Setup
import express from 'express';
import cors from 'cors';
import { userRoutes, userStatusRoutes } from './modules/user/index.js';
import { serviceRoutes } from './modules/service/index.js';
import { createAuthRoutes } from './modules/auth/index.js';
import { authRepository } from './modules/auth/index.js';
import { AuthService } from './modules/auth/index.js';
import { errorHandler, notFoundHandler, blockBannedUser } from './shared/middleware/index.js';
import { setupSwagger } from './shared/config/index.js';
import { professionRoutes } from './modules/profession/index.js';
import adminRoutes from './modules/admin/admin.routes.js';
import workerRoutes from './modules/worker/worker.routes.js';
import { missionRoutes } from './modules/mission/index.js';
import { paymentRepository } from './modules/payment/index.js';
import { missionRepository } from './modules/mission/index.js';
import { disputeRoutes } from './modules/dispute/index.js';
import { reviewRepository } from './modules/review/index.js';
import { CreateReviewUseCase, GetWorkerReviewsUseCase, DeleteReviewUseCase } from './modules/review/index.js';
import { ReviewController, createReviewRoutes } from './modules/review/index.js';
import { notificationRoutes } from './modules/notification/index.js';
import { notificationService } from './modules/notification/index.js';
import { passwordService } from './shared/security/password.service.js';

// Dashboard module imports
import { PrismaDashboardRepository } from './modules/dashboard/infrastructure/prisma-dashboard.repository.js';
import { GetAdminDashboardUseCase, GetWorkerDashboardUseCase, GetClientDashboardUseCase } from './modules/dashboard/application/index.js';
import { DashboardController, createDashboardRoutes } from './modules/dashboard/interface/index.js';
import { prisma } from './shared/prisma.js';

// Payment module imports
import { createPayTechService } from './modules/payment/infrastructure/paytech/PayTechService.js';
import { EscrowDomainService } from './modules/payment/domain/services/EscrowDomainService.js';
import { CreatePaymentUseCase } from './modules/payment/application/use-cases/CreatePaymentUseCase.js';
import { ReleaseEscrowUseCase } from './modules/payment/application/use-cases/ReleaseEscrowUseCase.js';
import { CancelMissionPaymentUseCase } from './modules/payment/application/use-cases/CancelMissionPaymentUseCase.js';
import { HandlePayTechWebhookUseCase } from './modules/payment/application/use-cases/HandlePayTechWebhookUseCase.js';
import { PaymentController } from './modules/payment/interface/PaymentController.js';
import { createPaymentRoutes } from './modules/payment/interface/payment.routes.js';

const app = express();

// ============================================
// Middleware
// ============================================

// CORS
app.use(cors());

// JSON body parser
app.use(express.json());

// ============================================
// Swagger Documentation
// ============================================
setupSwagger(app);

// ============================================
// Routes (Clean Architecture - Interface Layer)
// ============================================

// Initialize auth service with dependencies and create auth routes
const authService = new AuthService(authRepository, passwordService);
const authRoutes = createAuthRoutes(authService);

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================
app.use('/api/auth', authRoutes);
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// PROTECTED ROUTES - Authentication + Block Banned Users
// ============================================
// Ordre des middlewares :
// 1. authenticate() - Valide le JWT et injecte req.user
// 2. blockBannedUser - Bloque les utilisateurs bannis/supprimés
//
// Note: Les routes individuelles (userRoutes, etc.) contiennent déjà
// leurs propres middlewares authenticate() et authorize().
// blockBannedUser est ajouté ici comme couche supplémentaire de sécurité
// pour bloquer les utilisateurs bannis même si le login a réussi avant le ban.

const protectedRouter = express.Router();

// Appliquer blockBannedUser à toutes les routes protégées
// blockBannedUser est déjà une instance avec les exclusions par défaut
// (voir block-banned-user.middleware.ts ligne 40-44)
protectedRouter.use(blockBannedUser);

// Monter les routes
protectedRouter.use('/users', userRoutes);
protectedRouter.use('/users', userStatusRoutes);
protectedRouter.use('/services', serviceRoutes);
protectedRouter.use('/professions', professionRoutes);
protectedRouter.use('/admin', adminRoutes);
protectedRouter.use('/workers', workerRoutes);
protectedRouter.use('/missions', missionRoutes);
protectedRouter.use('/disputes', disputeRoutes);

// Initialize review module dependencies
const createReviewUseCase = new CreateReviewUseCase(reviewRepository, notificationService);
const getWorkerReviewsUseCase = new GetWorkerReviewsUseCase(reviewRepository);
const deleteReviewUseCase = new DeleteReviewUseCase(reviewRepository);

const reviewController = new ReviewController(
  createReviewUseCase,
  getWorkerReviewsUseCase,
  deleteReviewUseCase
);
const reviewRoutes = createReviewRoutes(reviewController);
protectedRouter.use('/reviews', reviewRoutes);

// Initialize notification module
protectedRouter.use('/notifications', notificationRoutes);

// Initialize dashboard module
const dashboardRepository = new PrismaDashboardRepository(prisma);
const getAdminDashboardUseCase = new GetAdminDashboardUseCase(dashboardRepository);
const getWorkerDashboardUseCase = new GetWorkerDashboardUseCase(dashboardRepository);
const getClientDashboardUseCase = new GetClientDashboardUseCase(dashboardRepository);
const dashboardController = new DashboardController(getAdminDashboardUseCase, getWorkerDashboardUseCase, getClientDashboardUseCase);
const dashboardRoutes = createDashboardRoutes(dashboardController);
protectedRouter.use('/dashboard', dashboardRoutes);

// Initialize payment module dependencies
const payTechService = createPayTechService();
const escrowDomainService = new EscrowDomainService({
  commissionPercent: parseInt(process.env.APPLICATION_COMMISSION_PERCENT || '10', 10),
  currency: 'XOF',
});

// Create payment use cases
const createPaymentUseCase = new CreatePaymentUseCase(
  paymentRepository,
  missionRepository,
  payTechService,
  escrowDomainService
);
const releaseEscrowUseCase = new ReleaseEscrowUseCase(
  paymentRepository,
  missionRepository,
  payTechService,
  escrowDomainService,
  notificationService
);
const cancelMissionPaymentUseCase = new CancelMissionPaymentUseCase(
  paymentRepository,
  missionRepository,
  payTechService,
  escrowDomainService
);
const handlePayTechWebhookUseCase = new HandlePayTechWebhookUseCase(
  paymentRepository,
  missionRepository,
  payTechService
);

// Create payment controller and routes
const paymentController = new PaymentController(
  createPaymentUseCase,
  releaseEscrowUseCase,
  cancelMissionPaymentUseCase,
  handlePayTechWebhookUseCase,
  paymentRepository
);
const paymentRoutes = createPaymentRoutes(paymentController);
protectedRouter.use('/payments', paymentRoutes);

// Mount protected routes under /api
app.use('/api', protectedRouter);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
