BEGIN;

LOCK TABLE "FundAccount" IN SHARE ROW EXCLUSIVE MODE;

CREATE OR REPLACE FUNCTION "FundAccount_status_active_guard"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW."active" = false AND NEW."status" = 'ENABLED'::"FundAccountStatus" THEN
      NEW."status" := 'DISABLED'::"FundAccountStatus";
    END IF;
    NEW."active" := (NEW."status" = 'ENABLED'::"FundAccountStatus");
    RETURN NEW;
  END IF;

  IF NEW."status" IS DISTINCT FROM OLD."status" THEN
    NEW."active" := (NEW."status" = 'ENABLED'::"FundAccountStatus");
    RETURN NEW;
  END IF;

  IF NEW."active" IS DISTINCT FROM OLD."active" THEN
    IF NEW."active" THEN
      -- An explicit legacy activation applies to both disabled and suspended accounts.
      NEW."status" := 'ENABLED'::"FundAccountStatus";
    ELSIF NEW."status" = 'ENABLED'::"FundAccountStatus" THEN
      NEW."status" := 'DISABLED'::"FundAccountStatus";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Preserve existing suspensions rather than silently resuming synchronization.
UPDATE "FundAccount"
SET "active" = false
WHERE "status" = 'SUSPENDED'::"FundAccountStatus" AND "active" = true;

COMMIT;
