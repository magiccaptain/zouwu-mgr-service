-- CreateEnum
CREATE TYPE "SubscriptionRedemptionDirection" AS ENUM ('SUBSCRIPTION', 'REDEMPTION');

-- CreateTable
CREATE TABLE "SubscriptionRedemptionRecord" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "direction" "SubscriptionRedemptionDirection" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "operator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionRedemptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionRedemptionRecord_fund_account_createdAt_idx" ON "SubscriptionRedemptionRecord"("fund_account", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "SubscriptionRedemptionRecord" ADD CONSTRAINT "SubscriptionRedemptionRecord_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionRedemptionRecord" ADD CONSTRAINT "SubscriptionRedemptionRecord_operator_fkey" FOREIGN KEY ("operator") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
