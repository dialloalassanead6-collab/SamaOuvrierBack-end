-- Review Module Migration
-- Adds review functionality to SamaOuvrier

-- 1. Create Review Status Enum
CREATE TYPE "review_statuses" AS ENUM ('pending', 'done');

-- 2. Add reviewStatus to Mission table
ALTER TABLE "missions" ADD COLUMN "review_status" "review_statuses" NOT NULL DEFAULT 'pending';

-- 3. Add averageRating and totalReviews to User table (for workers)
ALTER TABLE "users" ADD COLUMN "average_rating" Double precision NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "total_reviews" Integer NOT NULL DEFAULT 0;

-- 4. Create Review table (using text to match Mission.id type in existing schema)
CREATE TABLE "reviews" (
    "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "mission_id" text NOT NULL,
    "worker_id" text NOT NULL,
    "client_id" text NOT NULL,
    "rating" Integer NOT NULL,
    "comment" Text,
    "created_at" Timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. Create unique constraint for mission_id (one review per mission)
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_mission_id_unique" UNIQUE ("mission_id");

-- 6. Create index for worker reviews lookup
CREATE INDEX "reviews_worker_id_idx" ON "reviews"("worker_id");
