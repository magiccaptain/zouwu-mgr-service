ALTER TABLE "TransferRecord"
ADD COLUMN "subscription_redemption_id" INTEGER;

CREATE UNIQUE INDEX "TransferRecord_subscription_redemption_id_key"
ON "TransferRecord"("subscription_redemption_id");

ALTER TABLE "TransferRecord"
ADD CONSTRAINT "TransferRecord_subscription_redemption_id_fkey"
FOREIGN KEY ("subscription_redemption_id") REFERENCES "SubscriptionRedemptionRecord"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;