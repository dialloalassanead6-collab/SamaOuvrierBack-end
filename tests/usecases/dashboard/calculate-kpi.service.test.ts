// ============================================================================
// DASHBOARD KPI CALCULATION SERVICE TESTS
// ============================================================================
// Unit tests for CalculateKpi service
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { CalculateKpiService, type DerivedKpis } from '../../../src/modules/dashboard/application/calculate-kpi.service.js';
import type { UserStats, MissionStats, PaymentStats, DisputeStats } from '../../../src/modules/dashboard/domain/types/dashboard.types.js';
import { MissionStatus, DisputeStatus } from '../../__mocks__/prisma-client.js';

describe('CalculateKpiService', () => {
  let calculateKpiService: CalculateKpiService;

  beforeEach(() => {
    calculateKpiService = new CalculateKpiService();
  });

  describe('calculateDerivedKpis', () => {
    // -------------------------------------------------------------------------
    // Tests: Happy Path
    // -------------------------------------------------------------------------

    it('should calculate worker approval rate correctly', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 40,
          cancelledInPeriod: 10,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 80,
          cancellationRate: 20,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 500000,
          revenueInPeriod: 400000,
          platformCommissionTotal: 50000,
          paymentSuccessRate: 95,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 2,
          resolvedInPeriod: 8,
          disputeRate: 5,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.workerApprovalRate).toBe(80);
    });

    it('should return 0 for worker approval rate when no workers', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 10,
          clients: 10,
          workers: 0,
          workersApproved: 0,
          workersPending: 0,
          workersRejected: 0,
          bannedUsers: 0,
          activeUsers: 10,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 0,
          completedInPeriod: 0,
          cancelledInPeriod: 0,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 0,
          cancellationRate: 0,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 0,
          revenueInPeriod: 0,
          platformCommissionTotal: 0,
          paymentSuccessRate: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 0,
          open: 0,
          resolvedInPeriod: 0,
          disputeRate: 0,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.workerApprovalRate).toBe(0);
      expect(result.workerRejectionRate).toBe(0);
      expect(result.pendingWorkerRate).toBe(0);
    });

    it('should calculate mission success rate correctly', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 100,
          completedInPeriod: 75,
          cancelledInPeriod: 25,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 75,
          cancellationRate: 25,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 500000,
          revenueInPeriod: 400000,
          platformCommissionTotal: 50000,
          paymentSuccessRate: 95,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 2,
          resolvedInPeriod: 8,
          disputeRate: 5,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.missionSuccessRate).toBe(75);
    });

    it('should calculate platform margin rate correctly', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 40,
          cancelledInPeriod: 10,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 80,
          cancellationRate: 20,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 100000,
          revenueInPeriod: 80000,
          platformCommissionTotal: 10000,
          paymentSuccessRate: 95,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 2,
          resolvedInPeriod: 8,
          disputeRate: 5,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.platformMarginRate).toBe(10);
    });

    it('should calculate resolution rate correctly', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 40,
          cancelledInPeriod: 10,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 80,
          cancellationRate: 20,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 500000,
          revenueInPeriod: 400000,
          platformCommissionTotal: 50000,
          paymentSuccessRate: 95,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 20,
          open: 5,
          resolvedInPeriod: 15,
          disputeRate: 5,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.resolutionRate).toBe(75);
    });

    it('should return 0 resolution rate when no disputes', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 40,
          cancelledInPeriod: 10,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 80,
          cancellationRate: 20,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 500000,
          revenueInPeriod: 400000,
          platformCommissionTotal: 50000,
          paymentSuccessRate: 95,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 0,
          open: 0,
          resolvedInPeriod: 0,
          disputeRate: 0,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.resolutionRate).toBe(0);
    });

    // -------------------------------------------------------------------------
    // Tests: Edge Cases
    // -------------------------------------------------------------------------

    it('should calculate average revenue per mission correctly', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 20,
          cancelledInPeriod: 10,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 40,
          cancellationRate: 20,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 200000,
          revenueInPeriod: 100000,
          platformCommissionTotal: 10000,
          paymentSuccessRate: 95,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 2,
          resolvedInPeriod: 8,
          disputeRate: 5,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.averageRevenuePerMission).toBe(5000);
    });

    it('should return 0 average revenue when no completed missions', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 0,
          cancelledInPeriod: 10,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 0,
          cancellationRate: 20,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 0,
          revenueInPeriod: 0,
          platformCommissionTotal: 0,
          paymentSuccessRate: 95,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 2,
          resolvedInPeriod: 8,
          disputeRate: 5,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.averageRevenuePerMission).toBe(0);
    });

    // -------------------------------------------------------------------------
    // Tests: Platform Health Score
    // -------------------------------------------------------------------------

    it('should calculate platform health score (100 when all good)', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 40,
          cancelledInPeriod: 5,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 80,
          cancellationRate: 10,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 500000,
          revenueInPeriod: 400000,
          platformCommissionTotal: 50000,
          paymentSuccessRate: 100,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 0,
          resolvedInPeriod: 10,
          disputeRate: 0,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.platformHealthScore).toBe(100);
    });

    it('should reduce health score for high ban rate', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 50, // 50% banned
          activeUsers: 50,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 40,
          cancelledInPeriod: 5,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 80,
          cancellationRate: 10,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 500000,
          revenueInPeriod: 400000,
          platformCommissionTotal: 50000,
          paymentSuccessRate: 100,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 0,
          resolvedInPeriod: 10,
          disputeRate: 0,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert
      expect(result.platformHealthScore).toBeLessThan(100);
    });

    it('should reduce health score for high cancellation rate', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 0,
          activeUsers: 100,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 10,
          cancelledInPeriod: 40,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 20,
          cancellationRate: 80, // 80% cancellation rate
        } as MissionStats,
        paymentStats: {
          totalRevenue: 500000,
          revenueInPeriod: 400000,
          platformCommissionTotal: 50000,
          paymentSuccessRate: 100,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 10,
          open: 0,
          resolvedInPeriod: 10,
          disputeRate: 0,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert - Max penalty for cancellation is 20 points
      expect(result.platformHealthScore).toBeLessThanOrEqual(80);
    });

    it('should not go below 0 for platform health score', () => {
      // Arrange
      const stats = {
        userStats: {
          total: 100,
          clients: 50,
          workers: 50,
          workersApproved: 40,
          workersPending: 5,
          workersRejected: 5,
          bannedUsers: 100, // All banned
          activeUsers: 0,
          newUsersInPeriod: 0,
        } as UserStats,
        missionStats: {
          total: 50,
          completedInPeriod: 0,
          cancelledInPeriod: 50,
          byStatus: {} as Record<MissionStatus, number>,
          completionRate: 0,
          cancellationRate: 100,
        } as MissionStats,
        paymentStats: {
          totalRevenue: 0,
          revenueInPeriod: 0,
          platformCommissionTotal: 0,
          paymentSuccessRate: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageTransactionAmount: 0,
          escrowHeld: 0,
          escrowReleased: 0,
        } as PaymentStats,
        disputeStats: {
          total: 50,
          open: 50,
          resolvedInPeriod: 0,
          disputeRate: 100,
          byStatus: {} as Record<DisputeStatus, number>,
        } as DisputeStats,
      };

      // Act
      const result = calculateKpiService.calculateDerivedKpis(stats);

      // Assert - Should not go below 0
      expect(result.platformHealthScore).toBeGreaterThanOrEqual(0);
      expect(result.platformHealthScore).toBeLessThanOrEqual(100);
    });
  });
});
