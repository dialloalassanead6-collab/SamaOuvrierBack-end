/**
 * Review Entity
 * Domain entity representing a review/rating for a worker after a completed mission
 */
import { Rating } from './rating.vo.js';

export interface ReviewProps {
  id: string;
  missionId: string;
  workerId: string;
  clientId: string;
  rating: Rating;
  comment?: string;
  createdAt: Date;
}

export interface ReviewCreateProps {
  missionId: string;
  workerId: string;
  clientId: string;
  rating: Rating;
  comment?: string;
}

export class Review {
  private readonly _id: string;
  private readonly _missionId: string;
  private readonly _workerId: string;
  private readonly _clientId: string;
  private readonly _rating: Rating;
  private readonly _comment?: string;
  private readonly _createdAt: Date;

  private constructor(props: ReviewProps) {
    this._id = props.id;
    this._missionId = props.missionId;
    this._workerId = props.workerId;
    this._clientId = props.clientId;
    this._rating = props.rating;
    this._comment = props.comment as string;
    this._createdAt = props.createdAt;
  }

  /**
   * Create a new Review entity
   */
  static create(props: ReviewCreateProps): Review {
    return new Review({
      id: crypto.randomUUID(),
      missionId: props.missionId,
      workerId: props.workerId,
      clientId: props.clientId,
      rating: props.rating,
      ...(props.comment && { comment: props.comment }),
      createdAt: new Date(),
    });
  }

  /**
   * Reconstruct a Review from database
   */
  static fromDatabase(data: {
    id: string;
    missionId: string;
    workerId: string;
    clientId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
  }): Review {
    return new Review({
      id: data.id,
      missionId: data.missionId,
      workerId: data.workerId,
      clientId: data.clientId,
      rating: Rating.fromDatabase(data.rating),
      ...(data.comment && { comment: data.comment }),
      createdAt: data.createdAt,
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get missionId(): string {
    return this._missionId;
  }

  get workerId(): string {
    return this._workerId;
  }

  get clientId(): string {
    return this._clientId;
  }

  get rating(): Rating {
    return this._rating;
  }

  get comment(): string | undefined {
    return this._comment;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return {
      id: this._id,
      missionId: this._missionId,
      workerId: this._workerId,
      clientId: this._clientId,
      rating: this._rating.value,
      comment: this._comment,
      createdAt: this._createdAt.toISOString(),
    };
  }

  /**
   * Convert to response DTO (without internal IDs for client)
   */
  toResponse() {
    return {
      id: this._id,
      missionId: this._missionId,
      workerId: this._workerId,
      rating: this._rating.value,
      comment: this._comment,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
