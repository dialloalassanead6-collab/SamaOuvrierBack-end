// ============================================================================
// MISSION REPOSITORY MOCK
// ============================================================================
// Mock implementation of MissionRepository for testing
// Uses 'any' types for flexibility in test setup
// ============================================================================

import { vi } from 'vitest';
import type { MissionStatus } from '@prisma/client';

// Simple mission type for tests
export interface TestMission {
  id: string;
  clientId: string;
  workerId: string | null;
  serviceId: string;
  titre: string;
  description: string;
  prixMin: number;
  prixMax: number;
  prixFinal: number | null;
  montantRestant: number | null;
  status: MissionStatus;
  cancellationRequestedBy: 'CLIENT' | 'WORKER' | null;
  clientConfirmed: boolean;
  workerConfirmed: boolean;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Methods from Mission entity
  isPendingAccept?: () => boolean;
  acceptMission?: () => TestMission;
  toResponse?: () => Record<string, unknown>;
}

export interface MockMissionRepositoryOptions {
  missions?: TestMission[];
}

const createMockMission = (overrides: Partial<TestMission> = {}): TestMission => {
  const mission: TestMission = {
    id: `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    clientId: 'client-1',
    workerId: null,
    serviceId: 'service-1',
    titre: 'Test Mission',
    description: 'Test Description',
    prixMin: 5000,
    prixMax: 10000,
    prixFinal: null,
    montantRestant: null,
    status: 'PENDING_PAYMENT' as MissionStatus,
    cancellationRequestedBy: null,
    clientConfirmed: false,
    workerConfirmed: false,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  // Add entity methods
  mission.isPendingAccept = () => mission.status === 'PENDING_ACCEPT';
  mission.acceptMission = () => ({
    ...mission,
    status: 'CONTACT_UNLOCKED' as MissionStatus,
    updatedAt: new Date(),
  });
  mission.toResponse = () => ({
    id: mission.id,
    clientId: mission.clientId,
    workerId: mission.workerId,
    serviceId: mission.serviceId,
    titre: mission.titre,
    description: mission.description,
    prixMin: mission.prixMin,
    prixMax: mission.prixMax,
    prixFinal: mission.prixFinal,
    montantRestant: mission.montantRestant,
    status: mission.status,
    cancellationRequestedBy: mission.cancellationRequestedBy,
    clientConfirmed: mission.clientConfirmed,
    workerConfirmed: mission.workerConfirmed,
    rejectionReason: mission.rejectionReason,
    createdAt: mission.createdAt,
    updatedAt: mission.updatedAt,
  });

  return mission;
};

export const createMockMissionRepository = (
  options: MockMissionRepositoryOptions = {}
) => {
  const missions = options.missions ?? [createMockMission()];

  const repository = {
    findById: vi.fn(async (id: string): Promise<TestMission | null> => {
      return missions.find((m) => m.id === id) ?? null;
    }),

    findByIdWithDetails: vi.fn(async (id: string): Promise<TestMission | null> => {
      return missions.find((m) => m.id === id) ?? null;
    }),

    findAll: vi.fn(async (
      _skip: number,
      _take: number,
      _clientId?: string,
      _workerId?: string
    ): Promise<{ missions: TestMission[]; total: number }> => {
      return { missions, total: missions.length };
    }),

    findAllWithDetails: vi.fn(async (
      _skip: number,
      _take: number,
      _clientId?: string,
      _workerId?: string
    ): Promise<{ missions: TestMission[]; total: number }> => {
      return { missions, total: missions.length };
    }),

    findByClientId: vi.fn(async (clientId: string): Promise<TestMission[]> => {
      return missions.filter((m) => m.clientId === clientId);
    }),

    findByWorkerId: vi.fn(async (workerId: string): Promise<TestMission[]> => {
      return missions.filter((m) => m.workerId === workerId);
    }),

    create: vi.fn(async (data: Partial<TestMission>): Promise<TestMission> => {
      const newMission = createMockMission({
        ...data,
        status: 'PENDING_PAYMENT' as MissionStatus,
      });
      missions.push(newMission);
      return newMission;
    }),

    update: vi.fn(async (id: string, data: Partial<TestMission>): Promise<TestMission | null> => {
      const index = missions.findIndex((m) => m.id === id);
      if (index === -1) return null;
      
      const updated = { ...missions[index], ...data, updatedAt: new Date() };
      missions[index] = updated;
      return updated;
    }),

    delete: vi.fn(async (_id: string): Promise<void> => {
      // No-op for mock
    }),

    verifyServiceOwnership: vi.fn(async (_serviceId: string, _workerId: string): Promise<boolean> => {
      return true;
    }),
  };

  return repository;
};

export { createMockMission };
