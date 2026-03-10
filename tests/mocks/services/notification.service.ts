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
    // Notifications missions
    notifyMissionAccepted: vi.fn().mockResolvedValue(undefined),
    notifyMissionCompleted: vi.fn().mockResolvedValue(undefined),
    notifyMissionCancelled: vi.fn().mockResolvedValue(undefined),
    notifyMissionRefused: vi.fn().mockResolvedValue(undefined),
    // Notifications paiement
    notifyPaymentReceived: vi.fn().mockResolvedValue(undefined),
    notifyPaymentReleased: vi.fn().mockResolvedValue(undefined),
    notifyEscrowReleased: vi.fn().mockResolvedValue(undefined),
    notifyPaymentFailed: vi.fn().mockResolvedValue(undefined),
    // Notifications disputes
    notifyDisputeOpened: vi.fn().mockResolvedValue(undefined),
    notifyDisputeResolved: vi.fn().mockResolvedValue(undefined),
    // Notifications workers
    notifyWorkerApproved: vi.fn().mockResolvedValue(undefined),
    notifyWorkerRejected: vi.fn().mockResolvedValue(undefined),
    // Méthodes génériques
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
    // Méthodes additionnelles
    sendNotification: vi.fn().mockResolvedValue(undefined),
    notifyClient: vi.fn().mockResolvedValue(undefined),
    notifyWorker: vi.fn().mockResolvedValue(undefined),
  };
};

export const mockNotificationService = createMockNotificationService();
