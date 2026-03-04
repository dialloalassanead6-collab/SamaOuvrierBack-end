-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "mission_statuses" ADD VALUE 'pending_accept';
ALTER TYPE "mission_statuses" ADD VALUE 'refused';

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "client_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "worker_confirmed" BOOLEAN NOT NULL DEFAULT false;
