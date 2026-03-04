-- CreateEnum
CREATE TYPE "cancellation_requesters" AS ENUM ('client', 'worker');

-- AlterEnum
ALTER TYPE "mission_statuses" ADD VALUE 'cancel_requested';

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "cancellation_requested_by" "cancellation_requesters";
