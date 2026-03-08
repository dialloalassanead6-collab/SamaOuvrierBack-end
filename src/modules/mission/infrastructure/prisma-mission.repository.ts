// ============================================================================
// PRISMA MISSION REPOSITORY - INFRASTRUCTURE LAYER
// ============================================================================
// Implémente IMissionRepository en utilisant Prisma
// ============================================================================

import { PrismaClient, Prisma, MissionStatus as PrismaMissionStatus } from '@prisma/client';
import type { IMissionRepository, CreateMissionInput } from '../application/index.js';
import { Mission, type MissionWithDetails, type CancellationRequester, type MissionStatusType } from '../domain/index.js';

export class PrismaMissionRepository implements IMissionRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async findById(id: string): Promise<Mission | null> {
    const prismaMission = await this.prisma.mission.findUnique({
      where: { id },
    });

    if (!prismaMission) {
      return null;
    }

    return Mission.fromPrisma(prismaMission);
  }

  async findByIdWithDetails(id: string): Promise<MissionWithDetails | null> {
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
      cancellationRequestedBy: (prismaMission as any).cancellationRequestedBy as CancellationRequester | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clientConfirmed: (prismaMission as any).clientConfirmed ?? false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workerConfirmed: (prismaMission as any).workerConfirmed ?? false,
      status: prismaMission.status as MissionStatusType,
      createdAt: prismaMission.createdAt,
      updatedAt: prismaMission.updatedAt,
      client: prismaMission.client,
      worker: prismaMission.worker,
      service: prismaMission.service,
    };
  }

  async findAll(
    skip: number = 0,
    take: number = 100,
    clientId?: string,
    workerId?: string
  ): Promise<{ missions: Mission[]; total: number }> {
    const where: Prisma.MissionWhereInput = {};

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

  async findAllWithDetails(
    skip: number = 0,
    take: number = 100,
    clientId?: string,
    workerId?: string
  ): Promise<{ missions: MissionWithDetails[]; total: number }> {
    const where: Prisma.MissionWhereInput = {};

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
        cancellationRequestedBy: (m as any).cancellationRequestedBy as CancellationRequester | null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clientConfirmed: (m as any).clientConfirmed ?? false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workerConfirmed: (m as any).workerConfirmed ?? false,
        status: m.status as MissionStatusType,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        client: m.client,
        worker: m.worker,
        service: m.service,
      })),
      total,
    };
  }

  async create(input: CreateMissionInput): Promise<Mission> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
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

  async update(id: string, mission: Mission): Promise<Mission> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      prixFinal: mission.prixFinal,
      montantRestant: mission.montantRestant,
      cancellationRequestedBy: mission.cancellationRequestedBy,
      clientConfirmed: mission.clientConfirmed,
      workerConfirmed: mission.workerConfirmed,
      status: mission.status as unknown as PrismaMissionStatus,
    };

    const prismaMission = await this.prisma.mission.update({
      where: { id },
      data: updateData,
    });

    return Mission.fromPrisma(prismaMission);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mission.delete({
      where: { id },
    });
  }

  async verifyServiceOwnership(serviceId: string, workerId: string): Promise<boolean> {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        workerId: workerId,
      },
    });

    return service !== null;
  }

  async findByClientId(clientId: string): Promise<Mission[]> {
    const prismaMissions = await this.prisma.mission.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaMissions.map(Mission.fromPrisma);
  }

  async findByWorkerId(workerId: string): Promise<Mission[]> {
    const prismaMissions = await this.prisma.mission.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaMissions.map(Mission.fromPrisma);
  }

  // ============================================================================
  // METHODS FOR PAYMENT MODULE (IMissionRepositoryForPayment)
  // ============================================================================

  /**
   * Trouve les informations de contact du worker pour une mission
   * Utilisé pour permettre au client de contacter le worker après paiement
   */
  async findWorkerContactByMissionId(missionId: string): Promise<{
    id: string;
    nom: string;
    prenom: string;
    tel: string;
    email: string;
  } | null> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      select: { workerId: true },
    });

    if (!mission) {
      return null;
    }

    const worker = await this.prisma.user.findUnique({
      where: { id: mission.workerId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        tel: true,
        email: true,
      },
    });

    if (!worker) {
      return null;
    }

    return {
      id: worker.id,
      nom: worker.nom,
      prenom: worker.prenom,
      tel: worker.tel,
      email: worker.email,
    };
  }

  async updateStatus(id: string, status: string): Promise<Mission> {
    const prismaMission = await this.prisma.mission.update({
      where: { id },
      data: { status: status as PrismaMissionStatus },
    });
    return Mission.fromPrisma(prismaMission);
  }

  async markClientConfirmed(id: string): Promise<Mission> {
    const prismaMission = await this.prisma.mission.update({
      where: { id },
      data: { clientConfirmed: true },
    });
    return Mission.fromPrisma(prismaMission);
  }

  async markWorkerConfirmed(id: string): Promise<Mission> {
    const prismaMission = await this.prisma.mission.update({
      where: { id },
      data: { workerConfirmed: true },
    });
    return Mission.fromPrisma(prismaMission);
  }

  async hasBothConfirmed(id: string): Promise<boolean> {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
      select: { clientConfirmed: true, workerConfirmed: true },
    });
    return mission?.clientConfirmed === true && mission?.workerConfirmed === true;
  }
}

export const missionRepository = new PrismaMissionRepository();
