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
export declare class Review {
    private readonly _id;
    private readonly _missionId;
    private readonly _workerId;
    private readonly _clientId;
    private readonly _rating;
    private readonly _comment?;
    private readonly _createdAt;
    private constructor();
    /**
     * Create a new Review entity
     */
    static create(props: ReviewCreateProps): Review;
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
    }): Review;
    get id(): string;
    get missionId(): string;
    get workerId(): string;
    get clientId(): string;
    get rating(): Rating;
    get comment(): string | undefined;
    get createdAt(): Date;
    /**
     * Convert to plain object for database storage
     */
    toJSON(): {
        id: string;
        missionId: string;
        workerId: string;
        clientId: string;
        rating: number;
        comment: string | undefined;
        createdAt: string;
    };
    /**
     * Convert to response DTO (without internal IDs for client)
     */
    toResponse(): {
        id: string;
        missionId: string;
        workerId: string;
        rating: number;
        comment: string | undefined;
        createdAt: string;
    };
}
//# sourceMappingURL=review.entity.d.ts.map