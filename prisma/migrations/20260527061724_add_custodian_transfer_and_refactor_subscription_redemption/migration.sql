/*
  Warnings:

  - You are about to drop the column `cash_flow_date` on the `SubscriptionRedemptionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_redemption_id` on the `TransferRecord` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionRedemptionStatus" AS ENUM ('OPEN', 'CLOSE');

-- DropForeignKey
ALTER TABLE "TransferRecord" DROP CONSTRAINT "TransferRecord_subscription_redemption_id_fkey";

-- DropIndex
DROP INDEX "TransferRecord_subscription_redemption_id_key";

-- AlterTable
ALTER TABLE "SubscriptionRedemptionRecord" DROP COLUMN "cash_flow_date",
ADD COLUMN     "status" "SubscriptionRedemptionStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "TransferRecord" DROP COLUMN "subscription_redemption_id";

-- CreateTable
CREATE TABLE "CustodianTransfer" (
    "id" SERIAL NOT NULL,
    "fund_account" TEXT NOT NULL,
    "direction" "TransferDirection" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transfer_date" TEXT NOT NULL,
    "market" "Market",
    "remark" TEXT,
    "operator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscription_redemption_id" INTEGER,

    CONSTRAINT "CustodianTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustodianTransfer_fund_account_createdAt_idx" ON "CustodianTransfer"("fund_account", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "CustodianTransfer" ADD CONSTRAINT "CustodianTransfer_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodianTransfer" ADD CONSTRAINT "CustodianTransfer_subscription_redemption_id_fkey" FOREIGN KEY ("subscription_redemption_id") REFERENCES "SubscriptionRedemptionRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
