DROP INDEX "Trade_tradeDay_fundAccount_market_ticker_tradeId_key";

CREATE UNIQUE INDEX "Trade_tradeDay_fundAccount_market_ticker_tradeId_orderApiId_key"
ON "Trade"("tradeDay", "fundAccount", "market", "ticker", "tradeId", "orderApiId");