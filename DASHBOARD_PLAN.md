# Plan d'Architecture - Module Dashboard Admin

## 1. Vue d'Ensemble

Le module Dashboard fournira des statistiques agrégées et des métriques pour l'administrateur de la plateforme SamaOuvrier. Il permettra de suivre en temps réel l'activité de la plateforme.

## 2. Structure des Données du Dashboard

### 2.1 Types de Résultats (Domain Types)

```typescript
// Fichier: src/modules/dashboard/domain/types/dashboard.types.ts

/**
 * Statistiques globales des utilisateurs
 */
export interface UserStats {
  total: number;
  clients: number;
  workers: number;
  workersPending: number;
  workersApproved: number;
  workersRejected: number;
  activeUsers: number;
  bannedUsers: number;
  newUsersThisMonth: number;
}

/**
 * Statistiques des missions
 */
export interface MissionStats {
  total: number;
  byStatus: {
    PENDING_PAYMENT: number;
    PENDING_ACCEPT: number;
    CONTACT_UNLOCKED: number;
    NEGOTIATION_DONE: number;
    AWAITING_FINAL_PAYMENT: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCEL_REQUESTED: number;
    CANCELLED: number;
    REFUSED: number;
  };
  completedThisMonth: number;
  cancelledThisMonth: number;
  averagePrice: number;
}

/**
 * Statistiques des paiements
 */
export interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionAmount: number;
  escrowHeld: number;
  escrowReleased: number;
}

/**
 * Statistiques des litiges
 */
export interface DisputeStats {
  total: number;
  byStatus: {
    OPEN: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };
  openDisputes: number;
  resolvedThisMonth: number;
}

/**
 * Statistiques des services
 */
export interface ServiceStats {
  total: number;
  activeServices: number;
  topServices: Array<{
    serviceTitle: string;
    missionCount: number;
  }>;
}

/**
 * Réponse complète du dashboard admin
 */
export interface AdminDashboardResponse {
  userStats: UserStats;
  missionStats: MissionStats;
  paymentStats: PaymentStats;
  disputeStats: DisputeStats;
  serviceStats: ServiceStats;
  generatedAt: string;
}
```

## 3. Architecture des Use Cases

### 3.1 Use Cases à Implémenter

```
src/modules/dashboard/application/
├── get-admin-dashboard.usecase.ts    # Dashboard complet admin
├── get-user-stats.usecase.ts         # Stats utilisateurs uniquement
├── get-mission-stats.usecase.ts      # Stats missions uniquement
├── get-payment-stats.usecase.ts      # Stats paiements uniquement
├── get-dispute-stats.usecase.ts      # Stats litiges uniquement
└── index.ts                          # Export centralisé
```

### 3.2 Interface du Repository Dashboard

```typescript
// Fichier: src/modules/dashboard/application/dashboard.repository.interface.ts

import type {
  UserStats,
  MissionStats,
  PaymentStats,
  DisputeStats,
  ServiceStats,
} from "../domain/types/dashboard.types.js";

export interface IDashboardRepository {
  // User Stats
  getUserStats(): Promise<UserStats>;

  // Mission Stats
  getMissionStats(): Promise<MissionStats>;

  // Payment Stats
  getPaymentStats(): Promise<PaymentStats>;

  // Dispute Stats
  getDisputeStats(): Promise<DisputeStats>;

  // Service Stats
  getServiceStats(): Promise<ServiceStats>;

  // Combined (optimisation)
  getAllStats(): Promise<{
    userStats: UserStats;
    missionStats: MissionStats;
    paymentStats: PaymentStats;
    disputeStats: DisputeStats;
    serviceStats: ServiceStats;
  }>;
}
```

## 4. Infrastructure - Implémentation Prisma

### 4.1 Repository Prisma

```typescript
// Fichier: src/modules/dashboard/infrastructure/prisma-dashboard.repository.ts

import {
  PrismaClient,
  Role,
  WorkerStatus,
  MissionStatus,
  PaymentStatus,
  EscrowStatus,
  DisputeStatus,
} from "@prisma/client";
import type { IDashboardRepository } from "../../application/dashboard.repository.interface.js";
import type {
  UserStats,
  MissionStats,
  PaymentStats,
  DisputeStats,
  ServiceStats,
} from "../../domain/types/dashboard.types.js";

export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getUserStats(): Promise<UserStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      clients,
      workers,
      workersPending,
      workersApproved,
      workersRejected,
      activeUsers,
      bannedUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CLIENT } }),
      this.prisma.user.count({ where: { role: Role.WORKER } }),
      this.prisma.user.count({
        where: { role: Role.WORKER, workerStatus: WorkerStatus.PENDING },
      }),
      this.prisma.user.count({
        where: { role: Role.WORKER, workerStatus: WorkerStatus.APPROVED },
      }),
      this.prisma.user.count({
        where: { role: Role.WORKER, workerStatus: WorkerStatus.REJECTED },
      }),
      this.prisma.user.count({ where: { isActive: true, isBanned: false } }),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return {
      total,
      clients,
      workers,
      workersPending,
      workersApproved,
      workersRejected,
      activeUsers,
      bannedUsers,
      newUsersThisMonth,
    };
  }

  async getMissionStats(): Promise<MissionStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      statusCounts,
      completedThisMonth,
      cancelledThisMonth,
      avgPrice,
    ] = await Promise.all([
      this.prisma.mission.count(),
      this.prisma.mission.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      this.prisma.mission.count({
        where: {
          status: MissionStatus.COMPLETED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.mission.count({
        where: {
          status: MissionStatus.CANCELLED,
          updatedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.mission.aggregate({ _avg: { prixFinal: true } }),
    ]);

    const byStatus = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.status]),
    ) as MissionStats["byStatus"];

    return {
      total,
      byStatus,
      completedThisMonth,
      cancelledThisMonth,
      averagePrice: avgPrice._avg.prixFinal?.toNumber() || 0,
    };
  }

  async getPaymentStats(): Promise<PaymentStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [payments, escrows, statusCounts] = await Promise.all([
      this.prisma.payment.findMany(),
      this.prisma.escrow.findMany(),
      this.prisma.payment.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { amount: true },
      }),
    ]);

    const successfulPayments = payments.filter(
      (p) => p.status === PaymentStatus.SUCCESS,
    );
    const totalRevenue = successfulPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const monthlyRevenue = successfulPayments
      .filter((p) => p.createdAt >= startOfMonth)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const escrowHeld = escrows
      .filter((e) => e.status === EscrowStatus.HELD)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const escrowReleased = escrows
      .filter((e) => e.status === EscrowStatus.RELEASED)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      totalRevenue,
      monthlyRevenue,
      totalTransactions: payments.length,
      successfulTransactions: successfulPayments.length,
      failedTransactions: payments.filter(
        (p) => p.status === PaymentStatus.FAILED,
      ).length,
      averageTransactionAmount:
        successfulPayments.length > 0
          ? totalRevenue / successfulPayments.length
          : 0,
      escrowHeld,
      escrowReleased,
    };
  }

  async getDisputeStats(): Promise<DisputeStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, statusCounts, resolvedThisMonth] = await Promise.all([
      this.prisma.dispute.count(),
      this.prisma.dispute.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      this.prisma.dispute.count({
        where: {
          status: { in: [DisputeStatus.RESOLVED, DisputeStatus.CLOSED] },
          updatedAt: { gte: startOfMonth },
        },
      }),
    ]);

    const byStatus = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.status]),
    ) as DisputeStats["byStatus"];

    return {
      total,
      byStatus,
      openDisputes: (byStatus.OPEN || 0) + (byStatus.IN_PROGRESS || 0),
      resolvedThisMonth,
    };
  }

  async getServiceStats(): Promise<ServiceStats> {
    const [total, serviceMissionCounts] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.mission.groupBy({
        by: ["serviceId"],
        _count: { serviceId: true },
        orderBy: { _count: { serviceId: "desc" } },
        take: 10,
      }),
    ]);

    const topServices = await Promise.all(
      serviceMissionCounts.map(async (item) => {
        const service = await this.prisma.service.findUnique({
          where: { id: item.serviceId },
        });
        return {
          serviceTitle: service?.title || "Unknown",
          missionCount: item._count.serviceId,
        };
      }),
    );

    return {
      total,
      activeServices: total,
      topServices,
    };
  }

  async getAllStats() {
    const [userStats, missionStats, paymentStats, disputeStats, serviceStats] =
      await Promise.all([
        this.getUserStats(),
        this.getMissionStats(),
        this.getPaymentStats(),
        this.getDisputeStats(),
        this.getServiceStats(),
      ]);

    return {
      userStats,
      missionStats,
      paymentStats,
      disputeStats,
      serviceStats,
    };
  }
}
```

## 5. Interface - Routes et Controller

### 5.1 Controller

```typescript
// Fichier: src/modules/dashboard/interface/dashboard.controller.ts

import type { Request, Response } from "express";
import { GetAdminDashboardUseCase } from "../../application/get-admin-dashboard.usecase.js";
import { HTTP_STATUS } from "../../../shared/constants/messages.js";

export class DashboardController {
  constructor(
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
  ) {}

  async getAdminDashboard(req: Request, res: Response) {
    try {
      const dashboard = await this.getAdminDashboardUseCase.execute();
      return res.status(HTTP_STATUS.OK).json(dashboard);
    } catch (error) {
      // Gestion d'erreur
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Erreur lors de la récupération du dashboard" });
    }
  }
}
```

### 5.2 Routes

```typescript
// Fichier: src/modules/dashboard/interface/dashboard.routes.ts

import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { adaptRoute } from "../../../shared/adapters/express.adapter.js";

export function createDashboardRoutes(controller: DashboardController): Router {
  const router = Router();

  router.get(
    "/admin",
    adaptRoute(controller.getAdminDashboard.bind(controller)),
  );

  return router;
}
```

## 6. Structure Finale du Module

```
src/modules/dashboard/
├── domain/
│   └── types/
│       └── dashboard.types.ts      # Types TypeScript pour les stats
├── application/
│   ├── dashboard.repository.interface.ts
│   ├── get-admin-dashboard.usecase.ts
│   ├── get-user-stats.usecase.ts
│   ├── get-mission-stats.usecase.ts
│   ├── get-payment-stats.usecase.ts
│   ├── get-dispute-stats.usecase.ts
│   └── index.ts
├── infrastructure/
│   └── prisma/
│       └── prisma-dashboard.repository.ts
└── interface/
    ├── dashboard.controller.ts
    ├── dashboard.routes.ts
    └── index.ts
```

## 7. Intégration dans l'Application

### 7.1 Injection des Dépendances

```typescript
// Dans src/app.ts ou un fichier de configuration des modules

import { PrismaDashboardRepository } from "./modules/dashboard/infrastructure/prisma-dashboard.repository.js";
import { GetAdminDashboardUseCase } from "./modules/dashboard/application/get-admin-dashboard.usecase.js";
import { DashboardController } from "./modules/dashboard/interface/dashboard.controller.js";
import { createDashboardRoutes } from "./modules/dashboard/interface/dashboard.routes.js";

// Configuration
const dashboardRepository = new PrismaDashboardRepository(prisma);
const getAdminDashboardUseCase = new GetAdminDashboardUseCase(
  dashboardRepository,
);
const dashboardController = new DashboardController(getAdminDashboardUseCase);

// Routes
app.use("/api/dashboard", createDashboardRoutes(dashboardController));
```

## 8. Endpoints API

| Méthode | Route                     | Description                            |
| ------- | ------------------------- | -------------------------------------- |
| GET     | `/api/dashboard/admin`    | Retourne toutes les statistiques admin |
| GET     | `/api/dashboard/users`    | Retourne les stats utilisateurs        |
| GET     | `/api/dashboard/missions` | Retourne les stats missions            |
| GET     | `/api/dashboard/payments` | Retourne les stats paiements           |
| GET     | `/api/dashboard/disputes` | Retourne les stats litiges             |

## 9. Améliorations Futures Possibles

- **Filtres temporels**: Ajouter des paramètres `startDate` et `endDate` pour filtrer les statistiques par période
- **Graphiques**: Retourner des données formatées pour les graphiques (séries temporelles)
- **Cache**: Implémenter un cache Redis pour les statistiques fréquemment demandées
- **Export**: Ajouter la possibilité d'exporter les statistiques en CSV/PDF
