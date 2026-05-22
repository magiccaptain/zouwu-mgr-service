-- Add column for position change date (加仓日/减仓日)
ALTER TABLE "SubscriptionRedemptionRecord"
ADD COLUMN "position_change_day" TEXT;

-- Backfill from historical reduce_day to keep existing behavior after switch
UPDATE "SubscriptionRedemptionRecord"
SET "position_change_day" = "reduce_day"
WHERE "position_change_day" IS NULL
  AND "reduce_day" IS NOT NULL;
