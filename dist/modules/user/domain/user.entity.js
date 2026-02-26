// Domain Layer - User Entity
// Represents the core business object "User" with its rules and invariants
import { Role, WorkerStatus } from '@prisma/client';
/**
 * User Entity - Core domain object
 *
 * RESPONSIBILITIES:
 * - Represent a user in the domain
 * - Encapsulate user-related business rules
 * - Be independent of any framework (Prisma, Express, etc.)
 *
 * INVARIANTS:
 * - Email must be unique and valid
 * - Password must meet security requirements
 * - Role must be one of: ADMIN, CLIENT, WORKER
 */
export class User {
    id;
    nom;
    prenom;
    adresse;
    tel;
    email;
    role;
    workerStatus;
    rejectionReason;
    professionId;
    isActive;
    isBanned;
    deletedAt;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.nom = props.nom;
        this.prenom = props.prenom;
        this.adresse = props.adresse;
        this.tel = props.tel;
        this.email = props.email;
        this.role = props.role;
        this.workerStatus = props.workerStatus ?? null;
        this.rejectionReason = props.rejectionReason ?? null;
        this.professionId = props.professionId ?? null;
        this.isActive = props.isActive ?? true;
        this.isBanned = props.isBanned ?? false;
        this.deletedAt = props.deletedAt ?? null;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    /**
     * Check if user is an admin
     */
    isAdmin() {
        return this.role === Role.ADMIN;
    }
    /**
     * Check if user is a client
     */
    isClient() {
        return this.role === Role.CLIENT;
    }
    /**
     * Check if user is a worker
     */
    isWorker() {
        return this.role === Role.WORKER;
    }
    /**
     * Convert to plain object for response (excludes password)
     */
    toResponse() {
        return {
            id: this.id,
            nom: this.nom,
            prenom: this.prenom,
            adresse: this.adresse,
            tel: this.tel,
            email: this.email,
            role: this.role,
            workerStatus: this.workerStatus,
            rejectionReason: this.rejectionReason,
            professionId: this.professionId,
            isActive: this.isActive,
            isBanned: this.isBanned,
            deletedAt: this.deletedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    /**
     * Convert to plain object for response including rejection reason
     */
    toResponseWithRejectionReason() {
        return {
            id: this.id,
            nom: this.nom,
            prenom: this.prenom,
            adresse: this.adresse,
            tel: this.tel,
            email: this.email,
            role: this.role,
            workerStatus: this.workerStatus,
            rejectionReason: this.rejectionReason,
            professionId: this.professionId,
            isActive: this.isActive,
            isBanned: this.isBanned,
            deletedAt: this.deletedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    /**
     * Create User from Prisma entity (Factory method)
     */
    static fromPrisma(user) {
        return new User({
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            adresse: user.adresse,
            tel: user.tel,
            email: user.email,
            role: user.role,
            workerStatus: user.workerStatus,
            rejectionReason: user.rejectionReason,
            professionId: user.professionId,
            isActive: user.isActive,
            isBanned: user.isBanned,
            deletedAt: user.deletedAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
}
//# sourceMappingURL=user.entity.js.map