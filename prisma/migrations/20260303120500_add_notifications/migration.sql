/*
  Warnings:

  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "notification_types" AS ENUM ('account_created', 'account_pending_approval', 'account_approved', 'account_rejected', 'mission_created', 'mission_accepted', 'mission_refused', 'mission_completed', 'mission_cancelled', 'payment_received', 'payment_released', 'payment_refunded', 'dispute_opened', 'dispute_status_updated', 'dispute_resolved', 'review_received', 'system_notification');

-- CreateEnum
CREATE TYPE "notification_statuses" AS ENUM ('unread', 'read');

-- AlterTable
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "dispute_events" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "performed_by" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "notification_types" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "notification_statuses" NOT NULL DEFAULT 'unread',
    "read_at" TIMESTAMP(3),
    "related_id" TEXT,
    "related_type" TEXT,
    "push_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dispute_events_dispute_id_idx" ON "dispute_events"("dispute_id");

-- CreateIndex
CREATE INDEX "dispute_events_type_idx" ON "dispute_events"("type");

-- CreateIndex
CREATE INDEX "dispute_events_performed_by_idx" ON "dispute_events"("performed_by");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_status_idx" ON "notifications"("user_id", "status");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_related_id_related_type_idx" ON "notifications"("related_id", "related_type");

-- AddForeignKey
ALTER TABLE "dispute_events" ADD CONSTRAINT "dispute_events_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "reviews_mission_id_unique" RENAME TO "reviews_mission_id_key";
