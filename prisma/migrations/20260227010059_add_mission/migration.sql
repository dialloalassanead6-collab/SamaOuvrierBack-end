-- CreateEnum
CREATE TYPE "mission_statuses" AS ENUM ('pending_payment', 'contact_unlocked', 'negotiation_done', 'awaiting_final_payment', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "prix_min" DECIMAL(10,2) NOT NULL,
    "prix_max" DECIMAL(10,2) NOT NULL,
    "prix_final" DECIMAL(10,2),
    "montant_restant" DECIMAL(10,2),
    "status" "mission_statuses" NOT NULL DEFAULT 'pending_payment',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "missions_client_id_idx" ON "missions"("client_id");

-- CreateIndex
CREATE INDEX "missions_worker_id_idx" ON "missions"("worker_id");

-- CreateIndex
CREATE INDEX "missions_service_id_idx" ON "missions"("service_id");

-- CreateIndex
CREATE INDEX "missions_status_idx" ON "missions"("status");

-- CreateIndex
CREATE INDEX "missions_created_at_idx" ON "missions"("created_at");

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
