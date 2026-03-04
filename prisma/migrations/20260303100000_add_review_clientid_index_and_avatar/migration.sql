-- Add index on clientId for Review model
CREATE INDEX IF NOT EXISTS "reviews_client_id_idx" ON "reviews" ("client_id");

-- Add avatar column to users tableoptional, will be null if not set ()
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" VARCHAR(500);
