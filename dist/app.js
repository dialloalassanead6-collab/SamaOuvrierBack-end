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
import { passwordService } from './shared/security/password.service.js';
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
//# sourceMappingURL=app.js.map