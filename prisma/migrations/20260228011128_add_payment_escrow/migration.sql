-- CreateEnum
CREATE TYPE "payment_statuses" AS ENUM ('pending', 'success', 'failed', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "escrow_statuses" AS ENUM ('pending', 'held', 'released', 'refunded', 'partially_refunded');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'XOF',
    "status" "payment_statuses" NOT NULL DEFAULT 'pending',
    "payment_method" VARCHAR(50),
    "paytech_ref" VARCHAR(255),
    "idempotency_key" VARCHAR(255) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrows" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "worker_amount" DECIMAL(10,2) NOT NULL,
    "commission_amount" DECIMAL(10,2) NOT NULL,
    "status" "escrow_statuses" NOT NULL DEFAULT 'pending',
    "release_type" VARCHAR(50),
    "paytech_ref" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "released_at" TIMESTAMP(3),

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "payments_mission_id_idx" ON "payments"("mission_id");

-- CreateIndex
CREATE INDEX "payments_client_id_idx" ON "payments"("client_id");

-- CreateIndex
CREATE INDEX "payments_worker_id_idx" ON "payments"("worker_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paytech_ref_idx" ON "payments"("paytech_ref");

-- CreateIndex
CREATE UNIQUE INDEX "escrows_payment_id_key" ON "escrows"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "escrows_mission_id_key" ON "escrows"("mission_id");

-- CreateIndex
CREATE INDEX "escrows_mission_id_idx" ON "escrows"("mission_id");

-- CreateIndex
CREATE INDEX "escrows_status_idx" ON "escrows"("status");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
