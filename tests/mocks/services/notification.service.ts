// ============================================================================
// NOTIFICATION SERVICE MOCK
// ============================================================================
// Mock for NotificationService used in tests
// ============================================================================

import { vi } from 'vitest';

export interface NotificationPayload {
  missionId: string;
  clientId: string;
  workerId: string;
  workerName?: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a mock NotificationService
 */
export const createMockNotificationService = () => {
  return {
    notifyMissionAccepted: vi.fn().mockResolvedValue(undefined),
    notifyMissionCompleted: vi.fn().mockResolvedValue(undefined),
    notifyMissionCancelled: vi.fn().mockResolvedValue(undefined),
    notifyPaymentReceived: vi.fn().mockResolvedValue(undefined),
    notifyEscrowReleased: vi.fn().mockResolvedValue(undefined),
    notifyDisputeOpened: vi.fn().mockResolvedValue(undefined),
    notifyDisputeResolved: vi.fn().mockResolvedValue(undefined),
    notifyWorkerApproved: vi.fn().mockResolvedValue(undefined),
    notifyWorkerRejected: vi.fn().mockResolvedValue(undefined),
    createNotification: vi.fn().mockResolvedValue({
      id: `notif-${Date.now()}`,
      userId: 'user-1',
      type: 'TEST',
      title: 'Test',
      message: 'Test message',
      read: false,
      createdAt: new Date(),
    }),
    getUserNotifications: vi.fn().mockResolvedValue([]),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
    deleteNotification: vi.fn().mockResolvedValue(undefined),
  };
};

export const mockNotificationService = createMockNotificationService();
