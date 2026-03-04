// ============================================================================
// PRISMA MISSION REPOSITORY - INFRASTRUCTURE LAYER
// ============================================================================
// Implémente IMissionRepository en utilisant Prisma
// ============================================================================
import { PrismaClient, Prisma, MissionStatus as PrismaMissionStatus } from '@prisma/client';
import { Mission } from '../domain/index.js';
export class PrismaMissionRepository {
    prisma;
    constructor(prismaClient) {
        this.prisma = prismaClient ?? new PrismaClient();
    }
    async findById(id) {
        const prismaMission = await this.prisma.mission.findUnique({
            where: { id },
        });
        if (!prismaMission) {
            return null;
        }
        return Mission.fromPrisma(prismaMission);
    }
    async findByIdWithDetails(id) {
        const prismaMission = await this.prisma.mission.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        // NOTE: Email et tel retirés pour la sécurité
                    },
                },
                worker: {
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        // NOTE: Email et tel retirés pour la sécurité
                    },
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    },
                },
            },
        });
        if (!prismaMission) {
            return null;
        }
        return {
            id: prismaMission.id,
            clientId: prismaMission.clientId,
            workerId: prismaMission.workerId,
            serviceId: prismaMission.serviceId,
            prixMin: Number(prismaMission.prixMin),
            prixMax: Number(prismaMission.prixMax),
            prixFinal: prismaMission.prixFinal !== null ? Number(prismaMission.prixFinal) : null,
            montantRestant: prismaMission.montantRestant !== null ? Number(prismaMission.montantRestant) : null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cancellationRequestedBy: prismaMission.cancellationRequestedBy,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            clientConfirmed: prismaMission.clientConfirmed ?? false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            workerConfirmed: prismaMission.workerConfirmed ?? false,
            status: prismaMission.status,
            createdAt: prismaMission.createdAt,
            updatedAt: prismaMission.updatedAt,
            client: prismaMission.client,
            worker: prismaMission.worker,
            service: prismaMission.service,
        };
    }
    async findAll(skip = 0, take = 100, clientId, workerId) {
        const where = {};
        if (clientId) {
            where.clientId = clientId;
        }
        if (workerId) {
            where.workerId = workerId;
        }
        const [prismaMissions, total] = await Promise.all([
            this.prisma.mission.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.mission.count({ where }),
        ]);
        return {
            missions: prismaMissions.map(Mission.fromPrisma),
            total,
        };
    }
    async findAllWithDetails(skip = 0, take = 100, clientId, workerId) {
        const where = {};
        if (clientId) {
            where.clientId = clientId;
        }
        if (workerId) {
            where.workerId = workerId;
        }
        const [prismaMissions, total] = await Promise.all([
            this.prisma.mission.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    client: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            // NOTE: Email et tel retirés pour la sécurité
                        },
                    },
                    worker: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            // NOTE: Email et tel retirés pour la sécurité
                        },
                    },
                    service: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                        },
                    },
                },
            }),
            this.prisma.mission.count({ where }),
        ]);
        return {
            missions: prismaMissions.map((m) => ({
                id: m.id,
                clientId: m.clientId,
                workerId: m.workerId,
                serviceId: m.serviceId,
                prixMin: Number(m.prixMin),
                prixMax: Number(m.prixMax),
                prixFinal: m.prixFinal !== null ? Number(m.prixFinal) : null,
                montantRestant: m.montantRestant !== null ? Number(m.montantRestant) : null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cancellationRequestedBy: m.cancellationRequestedBy,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                clientConfirmed: m.clientConfirmed ?? false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                workerConfirmed: m.workerConfirmed ?? false,
                status: m.status,
                createdAt: m.createdAt,
                updatedAt: m.updatedAt,
                client: m.client,
                worker: m.worker,
                service: m.service,
            })),
            total,
        };
    }
    async create(input) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = {
            clientId: input.clientId,
            workerId: input.workerId,
            serviceId: input.serviceId,
            prixMin: input.prixMin,
            prixMax: input.prixMax,
            status: PrismaMissionStatus.PENDING_PAYMENT,
        };
        const prismaMission = await this.prisma.mission.create({
            data,
        });
        return Mission.fromPrisma(prismaMission);
    }
    async update(id, mission) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData = {
            prixFinal: mission.prixFinal,
            montantRestant: mission.montantRestant,
            cancellationRequestedBy: mission.cancellationRequestedBy,
            clientConfirmed: mission.clientConfirmed,
            workerConfirmed: mission.workerConfirmed,
            status: mission.status,
        };
        const prismaMission = await this.prisma.mission.update({
            where: { id },
            data: updateData,
        });
        return Mission.fromPrisma(prismaMission);
    }
    async delete(id) {
        await this.prisma.mission.delete({
            where: { id },
        });
    }
    async verifyServiceOwnership(serviceId, workerId) {
        const service = await this.prisma.service.findFirst({
            where: {
                id: serviceId,
                workerId: workerId,
            },
        });
        return service !== null;
    }
    async findByClientId(clientId) {
        const prismaMissions = await this.prisma.mission.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
        });
        return prismaMissions.map(Mission.fromPrisma);
    }
    async findByWorkerId(workerId) {
        const prismaMissions = await this.prisma.mission.findMany({
            where: { workerId },
            orderBy: { createdAt: 'desc' },
        });
        return prismaMissions.map(Mission.fromPrisma);
    }
    // ============================================================================
    // METHODS FOR PAYMENT MODULE (IMissionRepositoryForPayment)
    // ============================================================================
    async updateStatus(id, status) {
        const prismaMission = await this.prisma.mission.update({
            where: { id },
            data: { status: status },
        });
        return Mission.fromPrisma(prismaMission);
    }
    async markClientConfirmed(id) {
        const prismaMission = await this.prisma.mission.update({
            where: { id },
            data: { clientConfirmed: true },
        });
        return Mission.fromPrisma(prismaMission);
    }
    async markWorkerConfirmed(id) {
        const prismaMission = await this.prisma.mission.update({
            where: { id },
            data: { workerConfirmed: true },
        });
        return Mission.fromPrisma(prismaMission);
    }
    async hasBothConfirmed(id) {
        const mission = await this.prisma.mission.findUnique({
            where: { id },
            select: { clientConfirmed: true, workerConfirmed: true },
        });
        return mission?.clientConfirmed === true && mission?.workerConfirmed === true;
    }
}
export const missionRepository = new PrismaMissionRepository();
//# sourceMappingURL=prisma-mission.repository.js.map