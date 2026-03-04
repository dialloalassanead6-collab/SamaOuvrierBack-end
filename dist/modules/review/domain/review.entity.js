/**
 * Review Entity
 * Domain entity representing a review/rating for a worker after a completed mission
 */
import { Rating } from './rating.vo.js';
export class Review {
    _id;
    _missionId;
    _workerId;
    _clientId;
    _rating;
    _comment;
    _createdAt;
    constructor(props) {
        this._id = props.id;
        this._missionId = props.missionId;
        this._workerId = props.workerId;
        this._clientId = props.clientId;
        this._rating = props.rating;
        this._comment = props.comment;
        this._createdAt = props.createdAt;
    }
    /**
     * Create a new Review entity
     */
    static create(props) {
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
    static fromDatabase(data) {
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
    get id() {
        return this._id;
    }
    get missionId() {
        return this._missionId;
    }
    get workerId() {
        return this._workerId;
    }
    get clientId() {
        return this._clientId;
    }
    get rating() {
        return this._rating;
    }
    get comment() {
        return this._comment;
    }
    get createdAt() {
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
//# sourceMappingURL=review.entity.js.map