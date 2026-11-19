-- FundAccountStatus enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "FundAccountStatus" AS ENUM ('ENABLED', 'SUSPENDED', 'DISABLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "FundAccount" ADD COLUMN IF NOT EXISTS "status" "FundAccountStatus";
ALTER TABLE "FundAccount" ADD COLUMN IF NOT EXISTS "active" BOOLEAN;

-- status from legacy active
UPDATE "FundAccount"
SET "status" = CASE
  WHEN "active" = true THEN 'ENABLED'::"FundAccountStatus"
  ELSE 'DISABLED'::"FundAccountStatus"
END
WHERE "status" IS NULL
  AND "active" IS NOT NULL;

-- active from status (e.g. recover DB that dropped active)
UPDATE "FundAccount"
SET "active" = ("status" = 'ENABLED'::"FundAccountStatus")
WHERE "active" IS NULL
  AND "status" IS NOT NULL;

UPDATE "FundAccount" SET "status" = 'ENABLED'::"FundAccountStatus" WHERE "status" IS NULL;
UPDATE "FundAccount" SET "active" = true WHERE "active" IS NULL;

ALTER TABLE "FundAccount" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "FundAccount" ALTER COLUMN "status" SET DEFAULT 'ENABLED';
ALTER TABLE "FundAccount" ALTER COLUMN "active" SET NOT NULL;
ALTER TABLE "FundAccount" ALTER COLUMN "active" SET DEFAULT true;