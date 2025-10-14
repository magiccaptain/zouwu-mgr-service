-- CreateTable
CREATE TABLE "MarketValue" (
    "id" SERIAL NOT NULL,
    "trade_day" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "market" "Market" NOT NULL,
    "position" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "close_price" DOUBLE PRECISION NOT NULL,
    "close_price_date" TEXT NOT NULL,
    "fund_account" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketValue_trade_day_fund_account_ticker_market_key" ON "MarketValue"("trade_day", "fund_account", "ticker", "market");

-- AddForeignKey
ALTER TABLE "MarketValue" ADD CONSTRAINT "MarketValue_fund_account_fkey" FOREIGN KEY ("fund_account") REFERENCES "FundAccount"("account") ON DELETE RESTRICT ON UPDATE CASCADE;
