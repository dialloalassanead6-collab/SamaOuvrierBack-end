import { PrismaClient } from '@prisma/client';
import type { IMissionRepository, CreateMissionInput } from '../application/index.js';
import { Mission, type MissionWithDetails } from '../domain/index.js';
export declare class PrismaMissionRepository implements IMissionRepository {
    private prisma;
    constructor(prismaClient?: PrismaClient);
    findById(id: string): Promise<Mission | null>;
    findByIdWithDetails(id: string): Promise<MissionWithDetails | null>;
    findAll(skip?: number, take?: number, clientId?: string, workerId?: string): Promise<{
        missions: Mission[];
        total: number;
    }>;
    findAllWithDetails(skip?: number, take?: number, clientId?: string, workerId?: string): Promise<{
        missions: MissionWithDetails[];
        total: number;
    }>;
    create(input: CreateMissionInput): Promise<Mission>;
    update(id: string, mission: Mission): Promise<Mission>;
    delete(id: string): Promise<void>;
    verifyServiceOwnership(serviceId: string, workerId: string): Promise<boolean>;
    findByClientId(clientId: string): Promise<Mission[]>;
    findByWorkerId(workerId: string): Promise<Mission[]>;
    updateStatus(id: string, status: string): Promise<Mission>;
    markClientConfirmed(id: string): Promise<Mission>;
    markWorkerConfirmed(id: string): Promise<Mission>;
    hasBothConfirmed(id: string): Promise<boolean>;
}
export declare const missionRepository: PrismaMissionRepository;
//# sourceMappingURL=prisma-mission.repository.d.ts.map