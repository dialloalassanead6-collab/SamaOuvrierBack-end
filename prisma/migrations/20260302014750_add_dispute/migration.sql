-- CreateEnum
CREATE TYPE "dispute_statuses" AS ENUM ('pending', 'open', 'under_review', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "dispute_reasons" AS ENUM ('payment_issue', 'work_not_done', 'quality_unsatisfactory', 'no_show', 'cancellation_issue', 'communication_issue', 'other');

-- CreateEnum
CREATE TYPE "dispute_resolutions" AS ENUM ('client_wins', 'worker_wins', 'partial_refund', 'full_refund', 'no_refund', 'draw');

-- CreateTable
CREATE TABLE "dispute_evidences" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "description" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reported_user_id" TEXT NOT NULL,
    "reason" "dispute_reasons" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "dispute_statuses" NOT NULL DEFAULT 'pending',
    "resolution" "dispute_resolutions",
    "resolution_note" TEXT,
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispute_evidences_public_id_key" ON "dispute_evidences"("public_id");

-- CreateIndex
CREATE INDEX "dispute_evidences_dispute_id_idx" ON "dispute_evidences"("dispute_id");

-- CreateIndex
CREATE INDEX "disputes_mission_id_idx" ON "disputes"("mission_id");

-- CreateIndex
CREATE INDEX "disputes_reporter_id_idx" ON "disputes"("reporter_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "disputes_reported_user_id_idx" ON "disputes"("reported_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_mission_id_reporter_id_key" ON "disputes"("mission_id", "reporter_id");

-- AddForeignKey
ALTER TABLE "dispute_evidences" ADD CONSTRAINT "dispute_evidences_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
