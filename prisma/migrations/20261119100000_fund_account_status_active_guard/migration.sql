-- Repair inconsistent rows (e.g. legacy admin wrote active=false with default status=ENABLED)
UPDATE "FundAccount"
SET "status" = 'DISABLED'::"FundAccountStatus"
WHERE "status" = 'ENABLED'::"FundAccountStatus"
  AND "active" = false;

CREATE OR REPLACE FUNCTION "FundAccount_status_active_guard"()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW."active" = false AND NEW."status" = 'ENABLED'::"FundAccountStatus" THEN
      NEW."status" := 'DISABLED'::"FundAccountStatus";
    END IF;
    IF NEW."status" = 'ENABLED'::"FundAccountStatus" THEN
      NEW."active" := true;
    ELSE
      NEW."active" := false;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW."status" IS DISTINCT FROM OLD."status" THEN
    IF NEW."status" = 'ENABLED'::"FundAccountStatus" THEN
      NEW."active" := true;
    ELSE
      NEW."active" := false;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW."active" IS DISTINCT FROM OLD."active" THEN
    IF NEW."active" = false AND NEW."status" = 'ENABLED'::"FundAccountStatus" THEN
      NEW."status" := 'DISABLED'::"FundAccountStatus";
    ELSIF NEW."active" = true AND NEW."status" = 'DISABLED'::"FundAccountStatus" THEN
      NEW."status" := 'ENABLED'::"FundAccountStatus";
      NEW."active" := true;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "FundAccount_status_active_guard" ON "FundAccount";

CREATE TRIGGER "FundAccount_status_active_guard"
  BEFORE INSERT OR UPDATE ON "FundAccount"
  FOR EACH ROW
  EXECUTE FUNCTION "FundAccount_status_active_guard"();