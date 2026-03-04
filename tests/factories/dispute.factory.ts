// ============================================================================
// DISPUTE FACTORY - TEST DATA FACTORY
// ============================================================================
// Factory for creating test dispute data
// ============================================================================

import type { DisputeStatus, DisputeReason, DisputeResolution } from '@prisma/client';
import crypto from 'crypto';

export interface DisputeFactoryOptions {
  id?: string;
  missionId?: string;
  raisedById?: string;
  raisedAgainstId?: string;
  reason?: DisputeReason;
  description?: string;
  status?: DisputeStatus;
  resolution?: DisputeResolution | null;
  resolutionNotes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date | null;
}

export interface DisputeEvidenceFactoryOptions {
  id?: string;
  disputeId?: string;
  uploadedById?: string;
  fileUrl?: string;
  filePublicId?: string;
  description?: string | null;
  createdAt?: Date;
}

// ============================================================================
// DEFAULT DISPUTES
// ============================================================================

/**
 * Default open dispute
 */
export const defaultOpenDispute: DisputeFactoryOptions = {
  reason: 'QUALITY_UNSATISFACTORY',
  description: 'Le travail effectué ne correspond pas aux attentes',
  status: 'OPEN',
  resolution: null,
  resolutionNotes: null,
  resolvedAt: null,
};

/**
 * Default resolved dispute (full refund to client)
 */
export const defaultResolvedFullRefundDispute: DisputeFactoryOptions = {
  ...defaultOpenDispute,
  status: 'RESOLVED',
  resolution: 'FULL_REFUND',
  resolutionNotes: 'Full refund issued to client',
  resolvedAt: new Date(),
};

/**
 * Default resolved dispute (worker wins)
 */
export const defaultResolvedWorkerWinsDispute: DisputeFactoryOptions = {
  ...defaultOpenDispute,
  status: 'RESOLVED',
  resolution: 'WORKER_WINS',
  resolutionNotes: 'Payment released to worker',
  resolvedAt: new Date(),
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a dispute with custom options
 */
export const createDisputeFactory = (
  options: DisputeFactoryOptions = {}
): {
  id: string;
  missionId: string;
  raisedById: string;
  raisedAgainstId: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  resolutionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
} => {
  const now = new Date();
  return {
    id: options.id ?? `dispute-${crypto.randomUUID()}`,
    missionId: options.missionId ?? `mission-${crypto.randomUUID()}`,
    raisedById: options.raisedById ?? `client-${crypto.randomUUID()}`,
    raisedAgainstId: options.raisedAgainstId ?? `worker-${crypto.randomUUID()}`,
    reason: options.reason ?? 'OTHER',
    description: options.description ?? 'Description du litige',
    status: options.status ?? 'PENDING',
    resolution: options.resolution ?? null,
    resolutionNotes: options.resolutionNotes ?? null,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
    resolvedAt: options.resolvedAt ?? null,
  };
};

/**
 * Create dispute evidence with custom options
 */
export const createDisputeEvidenceFactory = (
  options: DisputeEvidenceFactoryOptions = {}
): {
  id: string;
  disputeId: string;
  uploadedById: string;
  fileUrl: string;
  filePublicId: string;
  description: string | null;
  createdAt: Date;
} => {
  const now = new Date();
  return {
    id: options.id ?? `evidence-${crypto.randomUUID()}`,
    disputeId: options.disputeId ?? `dispute-${crypto.randomUUID()}`,
    uploadedById: options.uploadedById ?? `user-${crypto.randomUUID()}`,
    fileUrl: options.fileUrl ?? 'https://cloudinary.com/test/image.jpg',
    filePublicId: options.filePublicId ?? 'test/image',
    description: options.description ?? null,
    createdAt: options.createdAt ?? now,
  };
};

// ============================================================================
// CONVENIENCE FACTORIES
// ============================================================================

/**
 * Create an open dispute
 */
export const createOpenDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({ ...defaultOpenDispute, ...options });
};

/**
 * Create a pending dispute
 */
export const createPendingDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    status: 'PENDING',
    ...options,
  });
};

/**
 * Create a resolved dispute with full refund
 */
export const createResolvedFullRefundDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({ ...defaultResolvedFullRefundDispute, ...options });
};

/**
 * Create a resolved dispute with worker wins
 */
export const createResolvedWorkerWinsDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({ ...defaultResolvedWorkerWinsDispute, ...options });
};

/**
 * Create a dispute for payment issue
 */
export const createPaymentIssueDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    reason: 'PAYMENT_ISSUE',
    ...options,
  });
};

/**
 * Create a dispute for work not done
 */
export const createWorkNotDoneDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    reason: 'WORK_NOT_DONE',
    ...options,
  });
};

/**
 * Create a dispute for no-show
 */
export const createNoShowDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    reason: 'NO_SHOW',
    ...options,
  });
};

/**
 * Create a dispute for quality unsatisfactory
 */
export const createQualityUnsatisfactoryDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    reason: 'QUALITY_UNSATISFACTORY',
    ...options,
  });
};

/**
 * Create a dispute for cancellation issue
 */
export const createCancellationIssueDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    reason: 'CANCELLATION_ISSUE',
    ...options,
  });
};

/**
 * Create a dispute for communication issue
 */
export const createCommunicationIssueDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    reason: 'COMMUNICATION_ISSUE',
    ...options,
  });
};

/**
 * Create a dispute for other reasons
 */
export const createOtherDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    reason: 'OTHER',
    ...options,
  });
};

/**
 * Create a closed dispute
 */
export const createClosedDispute = (
  options: DisputeFactoryOptions = {}
): ReturnType<typeof createDisputeFactory> => {
  return createDisputeFactory({
    ...defaultOpenDispute,
    status: 'CLOSED',
    ...options,
  });
};
