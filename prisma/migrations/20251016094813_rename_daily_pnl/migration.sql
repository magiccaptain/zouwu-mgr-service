/*
  Warnings:

  - You are about to drop the `DailyStat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DailyStat";

-- CreateTable
CREATE TABLE "DailyPnl" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "fund_account" TEXT NOT NULL,
    "rebalance_return" DOUBLE PRECISION NOT NULL,
    "rebalance_pnl" DOUBLE PRECISION NOT NULL,
    "rebalance_buy_commission" DOUBLE PRECISION NOT NULL,
    "rebalance_sell_commission" DOUBLE PRECISION NOT NULL,
    "t0_return" DOUBLE PRECISION NOT NULL,
    "t0_pnl" DOUBLE PRECISION NOT NULL,
    "t0_buy_commission" DOUBLE PRECISION NOT NULL,
    "t0_sell_commission" DOUBLE PRECISION NOT NULL,
    "hold_return" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brokerKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "companyKey" TEXT NOT NULL,

    CONSTRAINT "DailyPnl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPnl_trade_day_fund_account_key" ON "DailyPnl"("trade_day", "fund_account");
