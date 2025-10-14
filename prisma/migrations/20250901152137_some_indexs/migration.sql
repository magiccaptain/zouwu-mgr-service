/*
  Warnings:

  - A unique constraint covering the columns `[tradeDay,fundAccount,market,ticker]` on the table `Position` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tradeDay,ticker,market]` on the table `QuoteBrief` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Order_tradeDay_fundAccount_orderApiId_idx" ON "Order"("tradeDay", "fundAccount", "orderApiId");

-- CreateIndex
CREATE INDEX "Order_tradeDay_fundAccount_orderRef_idx" ON "Order"("tradeDay", "fundAccount", "orderRef");

-- CreateIndex
CREATE INDEX "Order_tradeDay_fundAccount_market_ticker_idx" ON "Order"("tradeDay", "fundAccount", "market", "ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Position_tradeDay_fundAccount_market_ticker_key" ON "Position"("tradeDay", "fundAccount", "market", "ticker");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteBrief_tradeDay_ticker_market_key" ON "QuoteBrief"("tradeDay", "ticker", "market");

-- CreateIndex
CREATE INDEX "Trade_tradeDay_fundAccount_orderApiId_idx" ON "Trade"("tradeDay", "fundAccount", "orderApiId");

-- CreateIndex
CREATE INDEX "Trade_tradeDay_fundAccount_orderRef_idx" ON "Trade"("tradeDay", "fundAccount", "orderRef");

-- CreateIndex
CREATE INDEX "Trade_tradeDay_fundAccount_market_ticker_idx" ON "Trade"("tradeDay", "fundAccount", "market", "ticker");
