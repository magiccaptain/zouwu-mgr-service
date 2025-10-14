-- CreateTable
CREATE TABLE "DailyStat" (
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

    CONSTRAINT "DailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyStat_trade_day_fund_account_key" ON "DailyStat"("trade_day", "fund_account");
