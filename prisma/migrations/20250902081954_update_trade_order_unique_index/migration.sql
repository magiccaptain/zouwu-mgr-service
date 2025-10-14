/*
  Warnings:

  - A unique constraint covering the columns `[tradeDay,fundAccount,market,ticker]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tradeDay,fundAccount,market,ticker]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Order_tradeDay_fundAccount_market_ticker_idx";

-- DropIndex
DROP INDEX "Trade_tradeDay_fundAccount_market_ticker_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Order_tradeDay_fundAccount_market_ticker_key" ON "Order"("tradeDay", "fundAccount", "market", "ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeDay_fundAccount_market_ticker_key" ON "Trade"("tradeDay", "fundAccount", "market", "ticker");
