-- AlterTable
ALTER TABLE "escrows" ADD COLUMN     "release_reason" VARCHAR(255),
ADD COLUMN     "released_by" VARCHAR(50),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;
