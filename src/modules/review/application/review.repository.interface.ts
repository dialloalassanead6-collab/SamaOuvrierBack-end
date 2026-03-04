/**
 * Review Repository Interface
 * Defines the contract for review data access
 * Follows the Dependency Inversion Principle
 */

export interface CreateReviewInput {
  missionId: string;
  workerId: string;
  clientId: string;
  rating: number;
  comment?: string;
}

export interface ReviewFilters {
  workerId?: string;
  clientId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Review data returned from repository
 */
export interface ReviewData {
  id: string;
  missionId: string;
  workerId: string;
  clientId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

/**
 * Client data for review enrichment
 */
export interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

/**
 * Enriched review data with client information
 */
export interface EnrichedReviewData extends ReviewData {
  client: ClientData;
}

/**
 * Mission data for review validation
 */
export interface MissionData {
  id: string;
  clientId: string;
  workerId: string;
  status: string;
  reviewStatus: string;
}

/**
 * Worker data for rating updates
 */
export interface WorkerData {
  id: string;
  averageRating: number;
  totalReviews: number;
}

/**
 * Dispute data for review validation
 */
export interface DisputeData {
  id: string;
  status: string;
  missionId: string;
}

export interface IReviewRepository {
  // Review CRUD
  create(input: CreateReviewInput): Promise<ReviewData>;
  findById(id: string): Promise<ReviewData | null>;
  findByMissionId(missionId: string): Promise<ReviewData | null>;
  findAll(filters: ReviewFilters, page: number, limit: number): Promise<PaginatedResult<ReviewData>>;
  findAllEnriched(filters: ReviewFilters, skip: number, limit: number): Promise<PaginatedResult<EnrichedReviewData>>;
  findByWorkerId(workerId: string): Promise<ReviewData[]>;
  findByClientId(clientId: string): Promise<ReviewData[]>;
  delete(id: string): Promise<void>;
  
  // Mission helpers
  findMissionById(missionId: string): Promise<MissionData | null>;
  updateMissionReviewStatus(missionId: string, status: string): Promise<void>;
  
  // Worker helpers
  updateWorkerRating(workerId: string, averageRating: number, totalReviews: number): Promise<void>;
  
  // Dispute helpers
  findActiveDisputeByMission(missionId: string): Promise<DisputeData | null>;
  
  // Transaction support
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
