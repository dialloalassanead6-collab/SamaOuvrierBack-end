// ============================================================================
// MISSION FACTORY - TEST DATA FACTORY
// ============================================================================
// Factory for creating test mission data
// ============================================================================

import type { MissionStatus } from '../__mocks__/prisma-client.js';
import crypto from 'crypto';

export interface MissionFactoryOptions {
  id?: string;
  clientId?: string;
  workerId?: string | null;
  serviceId?: string;
  titre?: string;
  description?: string;
  prixMin?: number;
  prixMax?: number;
  prixFinal?: number | null;
  montantRestant?: number | null;
  status?: MissionStatus;
  cancellationRequestedBy?: 'CLIENT' | 'WORKER' | null;
  clientConfirmed?: boolean;
  workerConfirmed?: boolean;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Default mission in PENDING_PAYMENT state
 */
export const defaultMissionPendingPayment: MissionFactoryOptions = {
  titre: 'Test Mission',
  description: 'Description de la mission de test',
  prixMin: 5000,
  prixMax: 10000,
  prixFinal: null,
  montantRestant: null,
  status: 'PENDING_PAYMENT',
  workerId: null,
  cancellationRequestedBy: null,
  clientConfirmed: false,
  workerConfirmed: false,
  rejectionReason: null,
};

/**
 * Default mission in PENDING_ACCEPT state
 */
export const defaultMissionPendingAccept: MissionFactoryOptions = {
  ...defaultMissionPendingPayment,
  status: 'PENDING_ACCEPT',
};

/**
 * Default mission in CONTACT_UNLOCKED state
 */
export const defaultMissionContactUnlocked: MissionFactoryOptions = {
  ...defaultMissionPendingPayment,
  status: 'CONTACT_UNLOCKED',
};

/**
 * Default mission in IN_PROGRESS state
 */
export const defaultMissionInProgress: MissionFactoryOptions = {
  ...defaultMissionPendingPayment,
  status: 'IN_PROGRESS',
  prixFinal: 7500,
};

/**
 * Default mission in COMPLETED state
 */
export const defaultMissionCompleted: MissionFactoryOptions = {
  ...defaultMissionPendingPayment,
  status: 'COMPLETED',
  prixFinal: 7500,
  clientConfirmed: true,
  workerConfirmed: true,
};

/**
 * Default mission in CANCELLED state
 */
export const defaultMissionCancelled: MissionFactoryOptions = {
  ...defaultMissionPendingPayment,
  status: 'CANCELLED',
};

/**
 * Default mission in CANCEL_REQUESTED state
 */
export const defaultMissionCancelRequested: MissionFactoryOptions = {
  ...defaultMissionPendingPayment,
  status: 'CANCEL_REQUESTED',
  cancellationRequestedBy: 'CLIENT',
};

/**
 * Create a mission with custom options
 */
export const createMissionFactory = (
  options: MissionFactoryOptions = {}
): {
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
} => {
  const now = new Date();
  return {
    id: options.id ?? `mission-${crypto.randomUUID()}`,
    clientId: options.clientId ?? `client-${crypto.randomUUID()}`,
    workerId: options.workerId ?? null,
    serviceId: options.serviceId ?? `service-${crypto.randomUUID()}`,
    titre: options.titre ?? 'Test Mission',
    description: options.description ?? 'Description de la mission',
    prixMin: options.prixMin ?? 5000,
    prixMax: options.prixMax ?? 10000,
    prixFinal: options.prixFinal ?? null,
    montantRestant: options.montantRestant ?? null,
    status: options.status ?? 'PENDING_PAYMENT',
    cancellationRequestedBy: options.cancellationRequestedBy ?? null,
    clientConfirmed: options.clientConfirmed ?? false,
    workerConfirmed: options.workerConfirmed ?? false,
    rejectionReason: options.rejectionReason ?? null,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
  };
};

/**
 * Create a mission pending payment
 */
export const createPendingPaymentMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({ ...defaultMissionPendingPayment, ...options });
};

/**
 * Create a mission pending accept
 */
export const createPendingAcceptMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({ ...defaultMissionPendingAccept, ...options });
};

/**
 * Create a mission with contact unlocked
 */
export const createContactUnlockedMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({ ...defaultMissionContactUnlocked, ...options });
};

/**
 * Create a mission in progress
 */
export const createInProgressMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({ ...defaultMissionInProgress, ...options });
};

/**
 * Create a completed mission
 */
export const createCompletedMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({ ...defaultMissionCompleted, ...options });
};

/**
 * Create a cancelled mission
 */
export const createCancelledMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({ ...defaultMissionCancelled, ...options });
};

/**
 * Create a mission with cancellation requested
 */
export const createCancelRequestedMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({ ...defaultMissionCancelRequested, ...options });
};

/**
 * Create a mission ready for final payment (negociation done, prixFinal > prixMin)
 */
export const createAwaitingFinalPaymentMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({
    ...defaultMissionPendingPayment,
    status: 'AWAITING_FINAL_PAYMENT',
    prixFinal: 8000,
    montantRestant: 3000,
    ...options,
  });
};

/**
 * Create a refused mission
 */
export const createRefusedMission = (
  options: MissionFactoryOptions = {}
): ReturnType<typeof createMissionFactory> => {
  return createMissionFactory({
    ...defaultMissionPendingPayment,
    status: 'REFUSED',
    rejectionReason: 'Prix trop bas',
    ...options,
  });
};
